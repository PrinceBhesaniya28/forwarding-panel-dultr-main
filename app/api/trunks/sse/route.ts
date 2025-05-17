import { addAuthToRequestOptions } from '@/utils/server-auth';
import { NextResponse } from 'next/server';

const API_URL = 'https://dialo.dollu.com/rest/trunks';
const POLLING_INTERVAL = 30000; // 30 seconds

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
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      console.log('Trunks SSE connection established');
      
      // Function to send data to the client
      const sendData = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Function to fetch and send trunks
      const fetchAndSendTrunks = async () => {
        try {
          const options = addAuthToRequestOptions(token, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
          
          const response = await fetch(API_URL, options);
          
          if (!response.ok) {
            throw new Error(`Backend API responded with status: ${response.status}`);
          }
          
          const result = await response.json();
          sendData(result);
        } catch (error) {
          console.error('Error fetching trunks:', error);
          sendData({ success: false, message: 'Failed to fetch trunks' });
        }
      };

      // Initial fetch
      await fetchAndSendTrunks();

      // Set up interval for subsequent fetches
      const interval = setInterval(fetchAndSendTrunks, POLLING_INTERVAL);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('Trunks client disconnected, cleaning up...');
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers });
} 