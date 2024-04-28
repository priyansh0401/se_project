const loginForm = document.querySelector('.form-wrapper.sign-in form');
const signupForm = document.querySelector('.form-wrapper.sign-up form');
const wrapper = document.querySelector('.wrapper');
const signUpLink = document.querySelector('.signUp-link');
const signInLink = document.querySelector('.signIn-link');

// Switch to the sign-up form
signUpLink.addEventListener('click', () => {
  wrapper.classList.add('animate-signIn');
  wrapper.classList.remove('animate-signUp');
});

// Switch to the login form
signInLink.addEventListener('click', () => {
  wrapper.classList.add('animate-signUp');
  wrapper.classList.remove('animate-signIn');
});

// Login form submission
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const loginEmailInput = document.querySelector('.form-wrapper.sign-in input[type="text"]');
  const loginPasswordInput = document.querySelector('.form-wrapper.sign-in input[type="password"]');
  const loginEmail = loginEmailInput.value;
  const loginPassword = loginPasswordInput.value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    const data = await response.text();

    if (response.ok) {
      Toastify({
        text: 'Login successful!',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
      }).showToast();
      loginForm.reset();
      window.location.href = 'dashboard.html'; // Replace with your dashboard page URL
    } else {
      Toastify({
        text: data || 'Incorrect email or password. Please try again.',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        },
      }).showToast();
    }
  } catch (error) {
    console.error('Error during login:', error);
    Toastify({
      text: 'Error logging in. Please try again.',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      style: {
        background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
      },
    }).showToast();
  }
});

// Sign-up form submission
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const signupEmailInput = document.querySelector('.form-wrapper.sign-up input[type="email"]');
  const signupPasswordInput = document.querySelector('.form-wrapper.sign-up input[type="password"]');
  const signupEmail = signupEmailInput.value;
  const signupPassword = signupPasswordInput.value;

  // console.log()
  try {
    const response = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: signupEmail, password: signupPassword }),
    });

    const data = await response.text();

    if (response.ok) {
      Toastify({
        text: 'Sign up successful! Please login.',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
      }).showToast();
      signupForm.reset();
    } else {
      Toastify({
        text: data || 'User already exists. Please login instead.',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        },
      }).showToast();
    }
  } catch (error) {
    console.error('Error during signup:', error);
    Toastify({
      text: 'Error signing up. Please try again.',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      style: {
        background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
      },
    }).showToast();
  }
});