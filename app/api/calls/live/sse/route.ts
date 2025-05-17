import { addAuthToRequestOptions } from '@/utils/server-auth';
import { NextResponse } from 'next/server';

const API_URL = 'http://68.183.181.86:3000/live-calls/calls';
const POLLING_INTERVAL = 1000; // 1 seconds

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
      console.log('SSE connection established');
      
      // Function to send data to the client
      const sendData = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
        console.log('Sent data to client:', data);
      };

      // Function to fetch and send live calls
      const fetchAndSendLiveCalls = async () => {
        try {
          console.log('Fetching live calls from API...');
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
          
          const data = await response.json();
          console.log('Received data from API:', data);
          sendData(data);
        } catch (error) {
          console.error('Error fetching live calls:', error);
          sendData({ success: false, message: 'Failed to fetch live calls' });
        }
      };

      // Initial fetch
      await fetchAndSendLiveCalls();

      // Set up interval for subsequent fetches
      const interval = setInterval(fetchAndSendLiveCalls, POLLING_INTERVAL);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('Client disconnected, cleaning up...');
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers });
} 