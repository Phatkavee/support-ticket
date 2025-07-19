// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { login } from "@/lib/auth-actions"
// import SignInWithGoogleButton from "./SignInWithGoogleButton"

// export function LoginForm() {
//   return (
//     <Card className="mx-auto max-w-sm">
//       <CardHeader>
//         <CardTitle className="text-2xl">Login</CardTitle>
//         <CardDescription>
//           Enter your email below to login to your account
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form action={login} autoComplete="off">
//             <div className="grid gap-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   placeholder="m@email.com"
//                   required
//                   autoComplete="off"
//                   spellCheck="false"
//                   autoCorrect="off"
//                   autoCapitalize="off"
//                   data-form-type="other"
//                   key="email-input"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <div className="flex items-center">
//                   <Label htmlFor="password">Password</Label>
//                   <Link href="#" className="ml-auto inline-block text-sm underline">
//                     Forgot your password?
//                   </Link>
//                 </div>
//                 <Input 
//                   id="password"   
//                   name="password" 
//                   type="password" 
//                   required 
//                   autoComplete="new-password"
//                   data-form-type="other"
//                   key="password-input"
//                 />
//               </div>
//               <Button type="submit" className="w-full">
//                 Login
//               </Button>
//              <SignInWithGoogleButton/> 
//             </div>
//         </form>
//         <div className="mt-4 text-center text-sm">
//           Don&apos;t have an account?{" "}
//           <Link href="/signup" className="underline">
//             Sign up
//           </Link>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }




import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/auth-actions"
import SignInWithGoogleButton from "./SignInWithGoogleButton"

export function LoginForm({ message }: { message?: string }) {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={login} autoComplete="off">
            <div className="grid gap-4">
              {message === "password-updated" && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded">
                  Your password has been updated successfully. Please login with your new password.
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  autoComplete="off"
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
                  data-form-type="other"
                  key="email-input"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </Link>
                </div>
                <Input 
                  id="password"   
                  name="password" 
                  type="password" 
                  required 
                  autoComplete="new-password"
                  data-form-type="other"
                  key="password-input"
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
             <SignInWithGoogleButton/> 
            </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}