export default {
  apt: [
    'git',
    'python3',
    'python3-venv',
    'python3-pip',
    'curl',
    'ca-certificates',
    'vim',
  ],

  // Global npm tools installed into the sandbox image. Keep this list focused on
  // hands-side tools. The hosted Pi brain runs in Salambo's worker, not here.
  npm: [],

  pip: [
    'pandas==2.2.3',
    'openpyxl==3.1.5',
    'XlsxWriter==3.2.0',
    'python-dateutil==2.9.0.post0',
    'python-docx==1.1.2',
    'python-pptx==1.0.2',
    'pypdf==5.1.0',
    'pdfplumber==0.11.4',
    'numpy==2.1.2',
    'rapidfuzz==3.10.1',
    'beautifulsoup4==4.12.3',
    'lxml==5.3.0',
  ],

  setup: '',
};
