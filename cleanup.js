const fs = require('fs');
const path = require('path');

const doctorDir = path.join(__dirname, 'src', 'features', 'doctor');

// 1. Move CompleteProfilePage
const src = path.join(doctorDir, 'CompleteProfilePage.jsx');
const dest = path.join(doctorDir, 'onboarding', 'CompleteProfilePage.jsx');
fs.copyFileSync(src, dest);

// 2. Delete the rest
const filesToDelete = [
  'CompleteProfilePage.jsx',
  'DoctorAppointmentsPage.jsx',
  'DoctorProfile.jsx',
  'MyClinic.jsx',
  'StartSessionPage.jsx'
];

filesToDelete.forEach(file => {
  try { fs.unlinkSync(path.join(doctorDir, file)); } catch(e) {}
});

// 3. Delete components folder
const componentsDir = path.join(doctorDir, 'components');
try {
  fs.rmSync(componentsDir, { recursive: true, force: true });
} catch(e) {}

console.log("Cleanup done");
