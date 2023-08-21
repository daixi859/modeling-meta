import { ConfigProvider } from "antd";
import Head from "next/head";

import zhCN from "antd/locale/zh_CN";

type Props = {
  children?: React.ReactNode;
};

const PageLayout: React.FC<Props> = ({ children }) => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          fontFamily: `"PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";`,
        },
      }}
    >
      <Head>
        <title>建模meta</title>
      </Head>
      {children}
    </ConfigProvider>
  );
};

export default PageLayout;
