export default function LoadingSkeleton({ type }) {
  if (type === 'audit') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card-static grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex justify-center">
            <div className="skeleton w-40 h-40 rounded-full" />
          </div>
          <div className="col-span-2 space-y-3">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="card-static space-y-3">
              <div className="skeleton h-4 w-32 rounded" />
              {[1, 2, 3, 4, 5].map(j => (
                <div key={j} className="skeleton h-3 w-full rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'competitor') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-static space-y-4">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton w-20 h-20 rounded-full mx-auto" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="skeleton h-12 rounded-lg" />
                ))}
              </div>
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'dapa') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card-static p-6">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <div className="skeleton h-4 w-40 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-static p-4 flex flex-col items-center">
              <div className="skeleton w-24 h-24 rounded-full" />
              <div className="skeleton h-3 w-20 rounded mt-3" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card-static p-4">
              <div className="skeleton h-3 w-20 rounded mb-2" />
              <div className="skeleton h-5 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'keywords') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
        <div className="card-static space-y-3">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-8 w-full rounded" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-10 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
