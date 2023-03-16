import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className={`bg-aa-0 dark:bg-aa-dark-0`}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
