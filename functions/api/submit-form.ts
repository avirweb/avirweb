interface Env {
  AZURE_APP_ID: string;
  AZURE_CLIENT_ID: string;
  AZURE_DIRECTORY_ID: string;
  AZURE_OBJECT_ID: string;
  AZURE_SECRET_ID: string;
  TURNSTILE_KEY: string;
}

const EMAIL_DESTINATIONS: Record<string, string[]> = {
  'homepage': ['sales@avir.com', 'alvaro@avir.com'],
  'commercial': ['sales@avir.com', 'alvaro@avir.com'],
  'residential': ['sales@avir.com', 'alvaro@avir.com'],
  'service': ['sales@avir.com', 'alvaro@avir.com'],
  'career': ['sales@avir.com', 'alvaro@avir.com'],
};

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  
  try {
    const formData = await request.formData();
    const turnstileToken = formData.get('cf-turnstile-response') as string;
    const formType = (formData.get('form-type') as string) || 'homepage';
    
    // Validate Turnstile
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_KEY, response: turnstileToken })
    });
    const result = await response.json();
    
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'CAPTCHA validation failed' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get access token
    const tokenResp = await fetch(`https://login.microsoftonline.com/${env.AZURE_DIRECTORY_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.AZURE_CLIENT_ID,
        client_secret: env.AZURE_SECRET_ID,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });
    const tokenData = await tokenResp.json();
    
    // Build email
    const name = formData.get('name') || formData.get('First-Name') || 'Unknown';
    const email = formData.get('email-address') || formData.get('email') || formData.get('email-2') || 'Unknown';
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a2e;">New AVIR Form Submission</h2>
  <p><strong>Form Type:</strong> ${formType}</p>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <hr>
  <p style="color: #666; font-size: 12px;">Sent from AVIR website</p>
</body>
</html>`;
    
    // Send email
    await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          subject: `New Submission: ${formType}`,
          body: { contentType: 'HTML', content: emailHtml },
          toRecipients: EMAIL_DESTINATIONS[formType]?.map(e => ({ emailAddress: { address: e } })) || []
        },
        saveToSentItems: true
      })
    });
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Thank you! Your submission has been received.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
