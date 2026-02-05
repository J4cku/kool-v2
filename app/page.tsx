import Image from 'next/image'

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#000',
    }}>
      <Image
        src="https://koolstudio.pl/kool/logo.png"
        alt="Kool Studio Logo"
        width={300}
        height={100}
        priority
      />
    </main>
  )
}
