/**
 * Mock HTTPClient for testing
 */

export class HTTPClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async post(
    path: string,
    body: Uint8Array,
    headers: Record<string, string>,
  ): Promise<{ body: Uint8Array | null; status?: number }> {
    return {
      body: new TextEncoder().encode(JSON.stringify({ success: true })),
      status: 200,
    };
  }

  async get(
    path: string,
    headers?: Record<string, string>,
  ): Promise<{ body: Uint8Array | null; status?: number }> {
    return {
      body: new TextEncoder().encode(JSON.stringify({ success: true })),
      status: 200,
    };
  }
}
