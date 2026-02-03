"use server"

export async function getOnchainKitApiKey(): Promise<string> {
  return process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ""
}
