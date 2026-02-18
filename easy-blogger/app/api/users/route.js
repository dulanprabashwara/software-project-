import { NextResponse } from 'next/server';

export async function GET() {
  const dummyUsers = [
    { id: "RID0024", name: "Emma Richardson", email: "emma.richardson@gmail.com", type: "Premium", status: "Active" },
    { id: "RID0012", name: "Michael Chen", email: "michael.chen@gmail.com", type: "Premium", status: "Active" },
    { id: "RID0060", name: "Sophia Martinez", email: "sophia.martinez@gmail.com", type: "Regular", status: "Banned" },
    { id: "RID0021", name: "Love Quinn", email: "love.quinn@gmail.com", type: "Premium", status: "Active" },
    { id: "RID0030", name: "John Smith", email: "john.smith@gmail.com", type: "Premium", status: "Active" },
    { id: "RID0005", name: "Alison Dilaurentis", email: "alison.dilaurentis@gmail.com", type: "Regular", status: "Active" },
    { id: "RID0034", name: "Guinevere Beck", email: "guinevere.beck@gmail.com", type: "Regular", status: "Active" },
    { id: "RID0016", name: "David Rose", email: "david.rose@gmail.com", type: "Regular", status: "Banned" }
  ];
  return NextResponse.json(dummyUsers);
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // FUTURE POSTGRESQL LOGIC:
    // const result = await prisma.auditLog.create({ data: body });
    
    console.log("📥 Audit Data Captured for PostgreSQL Table:");
    console.log(`- Row Data: [Admin: ${body.performedBy}, Action: ${body.action}, Reason: ${body.reason}]`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}