export const metadata = {
  title: 'Wrecked Verification',
  description: 'Token Verification System'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-800 to-purple-800 min-h-screen">
        {children}
      </body>
    </html>
  );
}
