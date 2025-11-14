import Link from "next/link";

const homepage = () => {
  return (
    <div>
      <Link href="/proker">Proker</Link>
      <Link href="/about">About</Link>
    </div>
  );
};

export default homepage;
