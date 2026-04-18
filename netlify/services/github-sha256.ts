export class GitHubSha256 {

  private static encoder = new TextEncoder();

  public static async verify(request: Request, rawBody: string): Promise<boolean> {
    const xHubSignature = request.headers.get('x-hub-signature-256') ?? '';
    const secret = process.env.WEBHOOK_SECRET ?? '';
    return GitHubSha256.verifySignature(secret, xHubSignature, rawBody);
  }

  private static async verifySignature(secret: string, header: string, payload: string) {
    try {
      const parts = header.split('=');
      const sigHex = parts[1];

      const algorithm = { name: 'HMAC', hash: { name: 'SHA-256' } };
      const keyBytes = GitHubSha256.encoder.encode(secret);
      const key = await crypto.subtle.importKey('raw', keyBytes, algorithm, false, ['sign', 'verify']);

      const sigBytes = GitHubSha256.hexToBytes(sigHex!);
      const dataBytes = GitHubSha256.encoder.encode(payload);

      return await crypto.subtle.verify(algorithm.name, key, sigBytes, dataBytes);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private static hexToBytes(hex: string) {
    const len = hex.length / 2;
    const bytes = new Uint8Array(len);
    let index = 0;
    for (let i = 0; i < hex.length; i += 2) {
      bytes[index] = parseInt(hex.slice(i, i + 2), 16);
      index++;
    }
    return bytes;
  }
}
