import { addAuthToRequestOptions } from '@/utils/server-auth';
import { NextResponse } from 'next/server';

const API_URL = 'http://68.183.181.86:3000/users/details';
const POLLING_INTERVAL = 5000; // 5 seconds

export async function GET(request: Request) {
  // Extract token from URL
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      console.log('Balance SSE connection established');

      // Function to send data to the client
      const sendData = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Function to fetch and send user balance
      const fetchAndSendUserBalance = async () => {
        try {
          // First try the /current endpoint if it exists
          const options = addAuthToRequestOptions(token, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });

          let response = await fetch(`${API_URL}/current`, options);

          // If that fails, try the main users endpoint
          if (!response.ok) {
            response = await fetch(API_URL, options);

            if (!response.ok) {
              throw new Error(
                `Backend API responded with status: ${response.status}`
              );
            }

            const result = await response.json();

            if (!result.success || !Array.isArray(result.data)) {
              throw new Error('Failed to fetch users data');
            }

            // Just use the first user for demonstration
            const currentUser = result;
            sendData({
              success: true,
              data: currentUser
            });
          } else {
            // If the /current endpoint worked, return its response
            const result = await response.json();
            sendData(result);
          }
        } catch (error) {
          console.error('Error fetching user balance:', error);
          sendData({ success: false, message: 'Failed to fetch user balance' });
        }
      };

      // Initial fetch
      await fetchAndSendUserBalance();

      // Set up interval for subsequent fetches
      const interval = setInterval(fetchAndSendUserBalance, POLLING_INTERVAL);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('Balance client disconnected, cleaning up...');
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers });
}
