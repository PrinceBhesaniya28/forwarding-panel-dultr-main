import { addAuthToRequestOptions } from '@/utils/server-auth';
import { NextResponse } from 'next/server';

// Base API URL with environment variable fallback
const BASE_API_URL = process.env.API_BASE_URL || 'http://68.183.181.86:3000';
const GET_TARGETS_URL = `${BASE_API_URL}/campaigns/targets`;
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
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      console.log('Targets SSE connection established');
      
      // Function to send data to the client
      const sendData = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
        console.log('Sent targets data to client');
      };

      // Function to fetch and send targets
      const fetchAndSendTargets = async () => {
        try {
          console.log('Fetching targets from API...');
          const options = addAuthToRequestOptions(token, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
          
          const response = await fetch(GET_TARGETS_URL, options);
          
          if (!response.ok) {
            throw new Error(`Backend API responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Received targets data from API');
          sendData(data);
        } catch (error) {
          console.error('Error fetching targets:', error);
          sendData({ success: false, message: 'Failed to fetch targets' });
        }
      };

      // Initial fetch
      await fetchAndSendTargets();

      // Set up interval for subsequent fetches
      const interval = setInterval(fetchAndSendTargets, POLLING_INTERVAL);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('Client disconnected from targets SSE, cleaning up...');
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers });
} 