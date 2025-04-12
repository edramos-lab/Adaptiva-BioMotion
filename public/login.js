document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
  
    if (res.ok) {
      // If the response is OK, we can parse the JSON
      const data = await res.text();
      alert('Login successful!');
      window.location.href = 'form.html';
    } else {
      // If the response is not OK, we read the response text to show the server error
      const errorText = await res.text(); // Read as text instead of json
      alert(`Login failed: ${errorText}`); // Show server error message
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Something went wrong');
  }
});
