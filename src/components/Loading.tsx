import { Blocks } from 'react-loader-spinner';

export default function Loading() {
  return (
    <div className="pointer-events-none fixed left-0 top-0 block h-full w-full">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-4">
        <Blocks
          visible={true}
          height="80"
          width="80"
          ariaLabel="blocks-loading"
          wrapperStyle={{}}
          wrapperClass="blocks-wrapper"
        />
      </div>
    </div>
  );
}
