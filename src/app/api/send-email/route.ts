import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectToDB } from '@/lib/mongoose';
import ShareLink from '@/lib/models/sharelink.model';
import Contact from '@/lib/models/contact.model';
import Mailjet from 'node-mailjet';

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC!,
  process.env.MJ_APIKEY_PRIVATE!
);


export async function POST(req: Request) {
  try {
    await connectToDB();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { billId, contactId } = await req.json();

    const contact = await Contact.findById(contactId);
    if (!contact || !contact.email) {
      return NextResponse.json({ error: 'Invalid contact' }, { status: 400 });
    }

    let share = await ShareLink.findOne({ billId, contactId });
    if (!share) {
      share = await ShareLink.create({
        billId,
        contactId,
        shareId: crypto.randomUUID(),
        createdBy: user.id,
      });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/shared-bill/${share.shareId}`;

    const emailRes = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.SENDER_EMAIL!,
              Name: 'BillSplit',
            },
            To: [
              {
                Email: contact.email,
                Name: contact.name || 'Friend',
              },
            ],
            Subject: "You've been sent a bill to review 💸",
            TextPart: `You have a new bill to review. Here is your link: ${shareUrl}`,
            HTMLPart: `<h3>Hey ${contact.name || 'there'},</h3>
                      <p>Your friend just shared a bill with you via BillSplit.</p>
                      <p><a href="${shareUrl}">Click here to view your portion of the bill</a>.</p>
                      <br />
                      <p>Cheers,<br />The BillSplit Team</p>>`,
          },
        ],
      });

    console.log('Email response:', emailRes.body);

    return NextResponse.json({ success: true, sent: true });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
