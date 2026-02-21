export default function Layout({ children }) {
  return (
    <div className="mx-auto overflow-hidden min-h-screen">
      <div className="flex justify-between bg-red-100 px-50 py-4">
        <h1>Public</h1>
        <h1>Private</h1>
      </div>

      <div className="bg-green-200  px-20 flex-1 min-h-screen w-full">
        {children}
      </div>
    </div>
  );
}
