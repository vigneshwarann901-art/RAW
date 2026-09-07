import {
  ArrowRight,
  Leaf,
  ShieldCheck
} from "lucide-react";


import {
  Link,
  useNavigate
} from "react-router-dom";


import {
  useState
} from "react";


import {
  useAuth
} from "../../auth/AuthProvider";



export default function Auth({
  mode
}:{
  mode:"login"|"register";
}){


const register =
mode==="register";


const navigate =
useNavigate();



const {
 signIn,
 signUp,
 updateRole
}=useAuth();



// ROLE

const [role,setRole] =
useState<"DONOR"|"SEEKER">("DONOR");



// CATEGORY

const [userType,setUserType] =
useState("");



// FORM DATA

const [name,setName] =
useState("");

const [email,setEmail] =
useState("");

const [password,setPassword] =
useState("");

const [phone,setPhone] =
useState("");

const [businessName,setBusinessName] =
useState("");

const [gstNumber,setGstNumber] =
useState("");

const [address,setAddress] =
useState("");



// LOGIN METHOD

const [loginMethod,setLoginMethod] =
useState<"EMAIL"|"PHONE">("EMAIL");



// OTP STATES

const [otp,setOtp] =
useState("");

const [emailVerified,setEmailVerified] =
useState(false);

const [phoneVerified,setPhoneVerified] =
useState(false);



// STATUS

const [error,setError] =
useState("");

const [message,setMessage] =
useState("");

const [busy,setBusy] =
useState(false);






const donorTypes = [

"Household",

"Industry",

"Hotel / Restaurant",

"Medical / Healthcare",

"Office / Organization",

"Retail Shop",

"Construction",

"Other"

];



const seekerTypes = [

"Manufacturer",

"Recycler",

"Construction Company",

"Organization",

"Other"

];






const verifyEmail = ()=>{


if(email.includes("@")){

setEmailVerified(true);

setMessage(
"Email OTP verified"
);

}

else{

setError(
"Enter valid email"
);

}

};







const verifyPhone = ()=>{


if(phone.length>=10){

setPhoneVerified(true);

setMessage(
"Mobile OTP verified"
);

}

else{

setError(
"Enter valid mobile number"
);

}

};







const submit = async()=>{


setBusy(true);

setError("");



if(register){


const result =
await signUp(
name || "RAW User",
email,
password,
role,
phone,
businessName
);



setBusy(false);



if(result.error){

setError(result.error);

return;

}



navigate(

role==="DONOR"

?
"/donor/dashboard"

:
"/seeker/dashboard"

);



return;


}





// LOGIN OTP CHECK


if(loginMethod==="EMAIL" && !emailVerified){

setBusy(false);

setError(
"Verify email OTP first"
);

return;

}




if(loginMethod==="PHONE" && !phoneVerified){

setBusy(false);

setError(
"Verify phone OTP first"
);

return;

}




setBusy(false);


// temporary frontend login

const roleResult=await updateRole(role);

if(roleResult.error){

setError(roleResult.error);

return;

}

// redirect based on selected role

console.log("ROLE:", role);

if(role === "DONOR"){

  navigate("/donor/dashboard");

}
else{

  navigate("/seeker/dashboard");

}

};





return (

<div className="
min-h-screen
bg-slate-950
flex
">


<div className="
w-full
grid
lg:grid-cols-2
bg-white
">



{/* LEFT VIDEO */}


<div className="
hidden
lg:flex
relative
overflow-hidden
bg-black
">


<video

autoPlay
loop
muted
playsInline

className="
absolute
inset-0
w-full
h-full
object-cover
"

>

<source

src="/vedios/login-demo.mp4"

type="video/mp4"

/>


</video>



<div className="
absolute
inset-0
bg-black/50
"/>



<div className="
relative
z-10
p-12
text-white
flex
flex-col
justify-between
h-full
">


<div className="
flex
items-center
gap-3
">


<div className="
bg-white
text-black
p-3
rounded-xl
">

<Leaf/>

</div>



<div>

<h1 className="
text-3xl
font-black
">

RAW

</h1>


<p className="
text-sm
text-gray-300
">

Reusable Asset Workflow

</p>


</div>


</div>





<div>

<h2 className="
text-5xl
font-black
">

Give useful materials another life.

</h2>



<p className="
mt-5
text-lg
text-gray-200
">

Connecting waste generators,
collectors and recyclers.

</p>


</div>



</div>


</div>
{/* RIGHT SIDE */}

<div className="
flex
items-start
justify-center
p-10
bg-white
overflow-y-auto
">


<div className="
w-full
max-w-xl
py-10
">





<div className="mb-8">


<p className="
text-emerald-600
font-bold
">

{

register

?

"Create RAW Account"

:

"Welcome Back"

}

</p>




<h2 className="
text-4xl
font-black
text-slate-900
mt-2
">

{

register

?

"Join RAW"

:

"Login to RAW"

}

</h2>




<p className="
mt-3
text-gray-500
">

{

register

?

"Connect with the circular economy"

:

"Use OTP to access RAW"

}

</p>



</div>








{/* REGISTER ROLE */}

{

register &&

<div className="
grid
grid-cols-2
gap-4
mb-6
">


<button

onClick={()=>setRole("DONOR")}

className={`

p-5
rounded-xl
border
text-left

${
role==="DONOR"

?

"border-emerald-500 bg-emerald-50"

:

"border-gray-200"

}

`}

>


<h3 className="
font-bold
text-lg
">

I Have RAW

</h3>


<p className="
text-sm
text-gray-500
">

I provide materials

</p>


</button>





<button

onClick={()=>setRole("SEEKER")}

className={`

p-5
rounded-xl
border
text-left

${
role==="SEEKER"

?

"border-emerald-500 bg-emerald-50"

:

"border-gray-200"

}

`}

>


<h3 className="
font-bold
text-lg
">

I Need RAW

</h3>


<p className="
text-sm
text-gray-500
">

I need materials

</p>


</button>



</div>

}







<div className="
space-y-4
">







{/* REGISTER NAME */}

{

register &&

<input

value={name}

onChange={
e=>setName(e.target.value)
}

placeholder="Full Name"

className="
w-full
border
rounded-xl
px-4
py-3
outline-none
focus:border-emerald-500
"

/>

}










{/* USER TYPE */}

{

register &&

<select

value={userType}

onChange={
e=>setUserType(e.target.value)
}

className="
w-full
border
rounded-xl
px-4
py-3
"

>


<option value="">

Select Account Type

</option>



{

(role==="DONOR"
?
donorTypes
:
seekerTypes
)

.map(type=>(

<option

key={type}

value={type}

>

{type}

</option>

))

}



</select>

}










{/* BUSINESS DETAILS */}

{

register &&

(

(role==="DONOR" &&
userType!=="Household" &&
userType!=="")
||

role==="SEEKER"

)

&&

<>


<input

value={businessName}

onChange={
e=>setBusinessName(e.target.value)
}

placeholder="Business / Company Name"

className="
w-full
border
rounded-xl
px-4
py-3
"

/>






<input

value={gstNumber}

onChange={
e=>setGstNumber(e.target.value)
}

placeholder="GST Number"

className="
w-full
border
rounded-xl
px-4
py-3
"

/>


</>

}









{/* ADDRESS */}

{

register &&

<input

value={address}

onChange={
e=>setAddress(e.target.value)
}

placeholder="Address"

className="
w-full
border
rounded-xl
px-4
py-3
"

/>

}








{/* MOBILE */}

{

register &&

<>


<input

value={phone}

onChange={
e=>setPhone(e.target.value)
}

placeholder="Mobile Number"

className="
w-full
border
rounded-xl
px-4
py-3
"

/>





<button

type="button"

onClick={verifyPhone}

className="
text-emerald-600
font-bold
text-sm
"

>

{

phoneVerified

?

"Mobile Verified ✓"

:

"Verify Mobile OTP"

}

</button>






{

!phoneVerified &&

<input

placeholder="Enter Mobile OTP"

value={otp}

onChange={
e=>setOtp(e.target.value)
}

className="
w-full
border
rounded-xl
px-4
py-3
"

/>

}



</>

}
{/* EMAIL FOR REGISTER */}

{

register &&

<>


<input

value={email}

onChange={
e=>setEmail(e.target.value)
}

placeholder="Email Address"

className="
w-full
border
rounded-xl
px-4
py-3
outline-none
focus:border-emerald-500
"

/>




<button

type="button"

onClick={verifyEmail}

className="
text-emerald-600
font-bold
text-sm
"

>

{

emailVerified

?

"Email Verified ✓"

:

"Verify Email OTP"

}

</button>





{

!emailVerified &&

<input

placeholder="Enter Email OTP"

value={otp}

onChange={
e=>setOtp(e.target.value)
}

className="
w-full
border
rounded-xl
px-4
py-3
"

/>

}



</>

}








{/* LOGIN FLOW */}

{

!register &&

<>
<div className="
grid
grid-cols-2
gap-4
mb-6
">


<button

onClick={()=>setRole("DONOR")}

className={`
p-4
rounded-xl
border
text-left

${
role==="DONOR"
?
"border-emerald-500 bg-emerald-50"
:
"border-gray-200"
}

`}

>

<h3 className="
font-bold
">

RAW Donor

</h3>


<p className="
text-sm
text-gray-500
">

I provide materials

</p>


</button>





<button

onClick={()=>setRole("SEEKER")}

className={`
p-4
rounded-xl
border
text-left

${
role==="SEEKER"
?
"border-emerald-500 bg-emerald-50"
:
"border-gray-200"
}

`}

>

<h3 className="
font-bold
">

RAW Seeker

</h3>


<p className="
text-sm
text-gray-500
">

I need materials

</p>


</button>


</div>

<div className="
grid
grid-cols-2
gap-3
mb-6
">


<button

onClick={()=>setLoginMethod("EMAIL")}

className={`

p-4
rounded-xl
border
font-bold

${
loginMethod==="EMAIL"

?

"border-emerald-500 bg-emerald-50"

:

"border-gray-200"

}

`}

>

Email Login

</button>





<button

onClick={()=>setLoginMethod("PHONE")}

className={`

p-4
rounded-xl
border
font-bold

${
loginMethod==="PHONE"

?

"border-emerald-500 bg-emerald-50"

:

"border-gray-200"

}

`}

>

Phone Login

</button>



</div>









{/* EMAIL LOGIN */}

{

loginMethod==="EMAIL"

&&

<>


<input

value={email}

onChange={
e=>setEmail(e.target.value)
}

placeholder="Registered Email"

className="
w-full
border
rounded-xl
px-4
py-3
"

/>





<button

type="button"

onClick={()=>{

setEmailVerified(true);

setMessage("Email OTP verified");

}}

className="
text-emerald-600
font-bold
text-sm
"

>

{

emailVerified

?

"Email Verified ✓"

:

"Send Email OTP"

}

</button>






{

!emailVerified &&

<input

value={otp}

onChange={
e=>setOtp(e.target.value)
}

placeholder="Enter Email OTP"

className="
w-full
border
rounded-xl
px-4
py-3
"

/>

}



</>

}









{/* PHONE LOGIN */}

{

loginMethod==="PHONE"

&&

<>


<input

value={phone}

onChange={
e=>setPhone(e.target.value)
}

placeholder="Registered Mobile Number"

className="
w-full
border
rounded-xl
px-4
py-3
"

/>





<button

type="button"

onClick={verifyPhone}

className="
text-emerald-600
font-bold
text-sm
"

>

{

phoneVerified

?

"Mobile Verified ✓"

:

"Send Mobile OTP"

}

</button>







{

!phoneVerified &&

<input

value={otp}

onChange={
e=>setOtp(e.target.value)
}

placeholder="Enter Mobile OTP"

className="
w-full
border
rounded-xl
px-4
py-3
"

/>

}



</>

}


</>

}







{/* PASSWORD ONLY REGISTER */}

{

register &&

<input

type="password"

value={password}

onChange={
e=>setPassword(e.target.value)
}

placeholder="Create Password"

className="
w-full
border
rounded-xl
px-4
py-3
"

/>

}



<button

disabled={busy}

onClick={submit}

className="
w-full
mt-5
rounded-xl
bg-slate-950
text-white
py-3.5
font-bold
flex
items-center
justify-center
gap-2
hover:bg-slate-800
transition
"

>

{

busy

?

"Processing..."

:

register

?

"Create RAW Account"

:

"Login"

}


<ArrowRight size={18}/>


</button>







{/* ERROR MESSAGE */}

{

error &&

<div className="
mt-4
rounded-xl
bg-red-50
border
border-red-200
text-red-700
p-3
text-sm
">

{error}

</div>

}







{/* SUCCESS MESSAGE */}

{

message &&

<div className="
mt-4
rounded-xl
bg-emerald-50
border
border-emerald-200
text-emerald-700
p-3
text-sm
">

{message}

</div>

}







<div className="
mt-8
flex
items-center
gap-3
text-sm
text-gray-500
">


<ShieldCheck size={18}/>


Secure RAW verification system


</div>







<p className="
mt-8
text-center
text-sm
text-gray-500
">


{

register

?

"Already have an account?"

:

"New to RAW?"

}


{" "}



<Link

to={

register

?

"/auth/login"

:

"/auth/register"

}

className="
font-bold
text-emerald-600
"

>


{

register

?

"Login"

:

"Create one"

}


</Link>



</p>






</div>


</div>


</div>


</div>


</div>


);

}
