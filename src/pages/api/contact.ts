import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email, name, message } = data;
    console.log('Received contact form data:', data); 

    // Validate the input
    if (!email || !name || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call Brevo API
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': import.meta.env.BREVO_API_KEY, // Store in . env
        'content-type': 'application/json'
      },
      body:  JSON.stringify({
        sender: {
          name: name,
          email: 'contact@johndavidson.dev', 
        },
        to: [
          {
            email: 'contact@johndavidson.dev', // Your receiving email
            name: 'John Davidson'
          }
        ],
        subject: 'New Contact Form Submission from johndavidson.dev (' + new Date().toLocaleDateString('en-GB') + ')',
        htmlContent: `
          <h3>New message from ${name}</h3>
          <p><strong>Email: </strong> ${email}</p>
          <p><strong>Message: </strong></p>
          <p>${message}</p>
        `,
        textContent: `New message from ${name}\nEmail: ${email}\nMessage:  ${message}`
      })
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse. json();
      console.error('Brevo API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await brevoResponse.json();
    return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};