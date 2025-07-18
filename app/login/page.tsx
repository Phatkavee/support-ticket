import React from 'react'
import { LoginForm } from './components/LoginForm'

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) => {
  const params = await searchParams;
  
  return (
    <div className="flex h-svh items-center">
      <LoginForm message={params.message} />
    </div>
  );
}

export default LoginPage