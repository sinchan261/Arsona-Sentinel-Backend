# Arsona-Sentinel-Backend

<!-- register page -->
 for register our page go to
  orgin-/arsona/auth/register(json data)
  {
    example:
{
   "password":"123456",
   "email":"gsaikat261@gmail.com",
   "confirmPassword":"123456",
   "name":"saikat",
   "MobileNumber":"819192829"
}
  }

<!-- login page -->

for login our page go to 
orgin-/arsona/auth/login(json data)
{
   "password":"123456",
   "email":"gsaikat261@gmail.com",
}


<!-- otp verification route -->
otp-verification
step 1(send the otp)
/arsona/otp-verification/forget-password
example(json)
  { "email":"gsaikat261@gmail.com",}

step-2(verify with otp)
/arsona/otp-verification/verification
{
   "email":"gsaikat261@gmail.com",
   "otp":"3154"
}

step-3(create new password)
/arsona/otp-verification/new_password

{
   "email":"gsaikat261@gmail.com",
   "newPassword":"1234",
   "confirmPassword":"1234"
}


<!-- validation -->


for validation check go to(get response)
 orgin-/validate/validationCheck (with no request)








