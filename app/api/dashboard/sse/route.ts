import { addAuthToRequestOptions } from '@/utils/server-auth';
import { NextResponse } from 'next/server';

const POLLING_INTERVAL = 5000; // 5 seconds

// API endpoints for different data types
const API_ENDPOINTS = {
  'live-calls': 'http://68.183.181.86:3000/live-calls/calls',
  'calls': '/api/cdr',
  'credits': '/api/dashboard/credits-used',
  'users': '/api/dashboard/users'
};

export async function GET(request: Request) {
  // Extract params from URL
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!startDate || !endDate) {
    return new Response('Missing date parameters', { status: 400 });
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
      console.log('Dashboard SSE connection established');
      
      // Function to send data to the client
      const sendData = (type: string, data: any) => {
        const dashboardData = { type, data };
        const message = `data: ${JSON.stringify(dashboardData)}\n\n`;
        controller.enqueue(encoder.encode(message));
        console.log(`Sent ${type} data to client`);
      };

      // Function to fetch data for each type
      const fetchDataByType = async (type: string) => {
        try {
          console.log(`Fetching ${type} data...`);
          const endpoint = API_ENDPOINTS[type];
          
          // Build query string
          const query = new URLSearchParams();
          if (type !== 'live-calls') { // live-calls doesn't need date params
            query.append('startDate', startDate);
            query.append('endDate', endDate);
          }
          
          const queryString = query.toString() ? `?${query.toString()}` : '';
          const apiUrl = `${endpoint}${queryString}`;
          
          // Different handling for external API vs internal APIs
          let response;
          if (type === 'live-calls') {
            const options = addAuthToRequestOptions(token, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              },
              cache: 'no-store'
            });
            response = await fetch(apiUrl, options);
          } else {
            // For internal APIs, use relative path and authorization header
            response = await fetch(new URL(apiUrl, request.url).toString(), {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              cache: 'no-store'
            });
          }
          
          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }
          
          const responseData = await response.json();
          
          // For internal APIs, we need to extract the data from the response
          if (type !== 'live-calls') {
            if (responseData.success) {
              sendData(type, responseData.data);
            } else {
              throw new Error(`API returned error: ${responseData.message || 'Unknown error'}`);
            }
          } else {
            // For live-calls, pass the entire response
            sendData(type, responseData.data);
          }
        } catch (error) {
          console.error(`Error fetching ${type} data:`, error);
          sendData(type, null); // Send null data on error
        }
      };

      // Function to fetch all data types
      const fetchAllData = async () => {
        // Fetch each data type
        await Promise.all(
          Object.keys(API_ENDPOINTS).map(type => fetchDataByType(type))
        );
      };

      // Initial fetch for all data
      await fetchAllData();

      // Set up interval for subsequent fetches
      const interval = setInterval(fetchAllData, POLLING_INTERVAL);

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