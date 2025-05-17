import { addAuthToRequestOptions } from '@/utils/server-auth';
import { NextResponse } from 'next/server';

const API_URL = 'http://68.183.181.86:3000/dashboard/call-record-graph';
const POLLING_INTERVAL = 3000; // 3 seconds

export async function GET(request: Request) {
  // Extract token and date range parameters from URL
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  
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
      console.log('Call record graph SSE connection established');
      
      // Function to send data to the client
      const sendData = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Function to fetch and send call record data
      const fetchAndSendCallRecordData = async () => {
        try {
          // Build query string with date parameters
          const query = new URLSearchParams();
          if (startDate) query.append('startDate', startDate);
          if (endDate) query.append('endDate', endDate);
          
          const options = addAuthToRequestOptions(token, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
          
          // Call the existing API endpoint
          const response = await fetch(`${API_URL}?${query.toString()}`, options);
          
          if (!response.ok) {
            throw new Error(`Backend API responded with status: ${response.status}`);
          }
          
          const result = await response.json();
          sendData(result);
        } catch (error) {
          console.error('Error fetching call record data:', error);
          sendData({ success: false, message: 'Failed to fetch call record data' });
        }
      };

      // Initial fetch
      await fetchAndSendCallRecordData();

      // Set up interval for subsequent fetches
      const interval = setInterval(fetchAndSendCallRecordData, POLLING_INTERVAL);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('Call record graph client disconnected, cleaning up...');
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers });
} 