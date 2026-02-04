export async function onRequestPost(context) {
  const { request, env } = context;
  
  const formData = await request.formData();
  const name = formData.get('name');
  const emailAddress = formData.get('email-address');
  const budget = formData.get('budget');
  const projectType = formData.get('project-type');
  
  if (!name || !emailAddress) {
    return new Response(JSON.stringify({
      error: 'Name and email address are required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  console.log('Form submission received:', {
    name,
    emailAddress,
    budget,
    projectType,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || 'unknown'
  });
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Thank you! Your submission has been received.',
    submittedAt: new Date().toISOString()
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}