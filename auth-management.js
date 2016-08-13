const ManagementClient = require('auth0').ManagementClient;
const request = require('request');

const management = new ManagementClient({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ2YUZjdVg1YmhONm9QaFl5bHc0b2w5YkQxZjJIcGo3UCIsInNjb3BlcyI6eyJ1c2VycyI6eyJhY3Rpb25zIjpbInJlYWQiLCJjcmVhdGUiXX19LCJpYXQiOjE0Njg3MDIyODQsImp0aSI6Ijk0MDNhZDQwYjQ4NTAwOGJjODU4YTBlOTQ2YmMwZDk2In0.jIqL0QZ0C2FZLw4P2MFmC4RnVc5iWLUJVTmz51qXzew',
  domain: 'michalhebe.eu.auth0.com'
});

// management.getUsers()
//   .then((users) => {
//     console.log(users);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

