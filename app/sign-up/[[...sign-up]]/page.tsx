import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex justify-center items-center py-20">
      <SignUp appearance={{ baseTheme: dark, variables: { colorPrimary: '#a855f7' } }} />
    </div>
  );
}
