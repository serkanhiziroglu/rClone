// src/app/communities/loading.tsx
export default function Loading() {
    return (
      <div className="max-w-6xl mx-auto p-4 pt-20">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
  
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="p-4 border rounded-lg space-y-3"
            >
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }