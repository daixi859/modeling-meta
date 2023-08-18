import Head from "next/head";

type Props = {
  children?: React.ReactNode
}


const PageLayout:React.FC<Props> = ({children}) => {
  return (
    <>
      <Head>
        <title>建模meta</title>
      </Head>
      {children}
    </>
  );
};

export default PageLayout;
