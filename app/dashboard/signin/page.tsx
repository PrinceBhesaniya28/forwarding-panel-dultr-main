import DefaultAuth from '@/components/auth';
import AuthUI from '@/components/auth/AuthUI';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod
} from '@/utils/auth-helpers/settings';

type ParamsType = { slug: string };
type SearchParamsType = { disable_button?: boolean };

export default async function SignIn(props: {
  params: Promise<ParamsType>;
  searchParams: Promise<SearchParamsType>;
}) {
  const { slug } = (await props.params);
  const { disable_button } = (await props.searchParams);
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();
  console.log('Params:', (await props.params));
  console.log('Search Params:', (await props.searchParams));
  let viewProp: string;

  if (typeof slug === 'string' && viewTypes.includes(slug)) {
    viewProp = slug;
  } else {
    const preferredSignInView =
      (await cookies()).get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/dashboard/signin/${viewProp}`);
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && viewProp !== 'update_password') {
    return redirect('/dashboard/main');
  } else if (!user && viewProp === 'update_password') {
    return redirect('/dashboard/signin');
  }

  return (
    <DefaultAuth viewProp={viewProp}>
      <div>
        <AuthUI
          viewProp={viewProp}
          user={user}
          allowPassword={allowPassword}
          allowEmail={allowEmail}
          redirectMethod={redirectMethod}
          disableButton={disable_button}
          allowOauth={allowOauth}
        />
      </div>
    </DefaultAuth>
  );
}
