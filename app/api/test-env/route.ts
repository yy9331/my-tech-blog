import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    MCP_SHARED_SECRET: process.env.MCP_SHARED_SECRET ? '已设置' : '未设置',
    MCP_CLIENT_ID: process.env.MCP_CLIENT_ID ? '已设置' : '未设置',
    MCP_SIGNATURE_SECRET: process.env.MCP_SIGNATURE_SECRET ? '已设置' : '未设置',
    MCP_ALLOWED_CLIENTS: process.env.MCP_ALLOWED_CLIENTS ? '已设置' : '未设置',
    ALLOWED_CLIENTS_VALUE: process.env.MCP_ALLOWED_CLIENTS,
  });
}
