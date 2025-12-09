import Image from "next/image";
import { FC } from "react";

export const Header: FC = () => (
  <div className="App">
    <header className="App-header">
      <Image
        src="/vercel.svg"
        width={100}
        height={100}
        className="App-logo mx-auto"
        alt="logo"
      />
      <h1 className="App-title mt-3">Welcome to JSON Forms with NextJS</h1>
      <p className="App-intro">More Forms. Less Code.</p>
    </header>
  </div>
);
