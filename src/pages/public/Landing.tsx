import { motion } from "framer-motion";
import {
  Recycle,
  Users,
  Leaf,
  BarChart3,
  Truck,
  Factory
} from "lucide-react";
import { Link } from "react-router-dom";


export default function Landing() {

return (

<div className="min-h-screen bg-[#020617] text-white">


{/* NAVBAR */}

<nav className="
flex
items-center
justify-between
px-10
py-6
border-b
border-white/10
">


<div className="
text-3xl
font-bold
text-emerald-400
">
RAW
</div>



<div className="
hidden md:flex
gap-8
text-gray-300
">


<a href="#">
Home
</a>


<a href="#about">
About Us
</a>


<a href="#vision">
Vision
</a>


<a href="#impact">
Impact
</a>


</div>




<div className="flex gap-4">


<Link
to="/auth/login"
className="
px-5
py-2
rounded-xl
border
border-emerald-400
text-emerald-400
hover:bg-emerald-400
hover:text-black
transition
"
>
Login
</Link>



<Link
to="/auth/register"
className="
px-5
py-2
rounded-xl
bg-emerald-500
hover:bg-emerald-600
transition
"
>
Register
</Link>


</div>


</nav>







{/* HERO SECTION */}


<section className="
px-10
py-20
text-center
">



{/* VIDEO */}


<div className="
w-full
h-[500px]
rounded-3xl
overflow-hidden
mb-12
border
border-emerald-500/20
relative
">


<video

autoPlay
loop
muted
playsInline

className="
w-full
h-full
object-cover
"

>

<source

src="/vedios/raw-demo.mp4.mp4"

type="video/mp4"

/>

</video>



<div className="
absolute
bottom-6
left-6
text-left
bg-black/60
px-5
py-3
rounded-xl
max-w-xl
">


<h2 className="
text-xl
md:text-2xl
font-bold
">

Transforming Waste Into Resources

</h2>


<p className="
mt-1
text-sm
md:text-base
text-gray-200
">

Powered by RAW Circular Economy Network

</p>


</div>


</div>







<motion.h1

initial={{
opacity:0,
y:40
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:0.8
}}

className="
text-5xl
md:text-7xl
font-bold
leading-tight
"

>


Ready to transform waste into{" "}

<span className="
text-emerald-400
">

valuable resources?

</span>


</motion.h1>







<p className="
mt-8
max-w-4xl
mx-auto
text-xl
text-gray-400
">

RAW is a smart circular economy platform connecting
waste generators, collectors and recyclers to recover,
reuse and recycle materials efficiently.

</p>






<Link

to="/auth/login"

className="
inline-block
mt-10
px-10
py-4
rounded-2xl
bg-emerald-500
text-lg
font-bold
hover:bg-emerald-600
"

>

Start Recycling

</Link>


</section>







{/* FEATURES */}


<section className="
grid
md:grid-cols-3
gap-8
px-10
py-16
">


<Card

icon={<Recycle/>}

title="Digital Recycling Network"

text="Connecting waste generators, collectors and recyclers in one ecosystem."

/>



<Card

icon={<Users/>}

title="Smart Waste Matching"

text="Helping reusable materials reach the right people."

/>



<Card

icon={<BarChart3/>}

title="Environmental Tracking"

text="Monitoring waste recovery and sustainability impact."

/>



</section>







{/* ABOUT */}


<section

id="about"

className="
px-10
py-20
text-center
"

>


<h2 className="
text-4xl
font-bold
">

Who Are We?

</h2>



<p className="
mt-6
max-w-5xl
mx-auto
text-lg
text-gray-400
">

RAW is a technology-driven recycling ecosystem
designed to connect waste generators, collectors
and recyclers.

Our mission is to give every reusable material
a second life instead of becoming waste.

</p>


</section>
// VISION SECTION

<section

id="vision"

className="
px-10
py-20
bg-white/5
"

>


<h2 className="
text-4xl
font-bold
text-center
mb-14
">

Our Vision

</h2>



<div className="
grid
md:grid-cols-2
gap-12
items-center
max-w-6xl
mx-auto
">



<div className="
space-y-6
">


<VisionCard

title="Circular Economy"

text="Building a future where waste becomes a valuable resource instead of landfill."

/>



<VisionCard

title="Cleaner Planet"

text="Reducing pollution and improving recycling efficiency through technology."

/>



<VisionCard

title="Empowered Collectors"

text="Creating opportunities for collection networks and recycling communities."

/>


</div>






<motion.div

initial={{
opacity:0,
x:100
}}

whileInView={{
opacity:1,
x:0
}}

transition={{
duration:0.8
}}

viewport={{
once:true
}}

>


<img

src="/images/recycling-cycle.png.jpg"

alt="RAW recycling workflow"

className="
rounded-3xl
shadow-2xl
w-full
"

/>


</motion.div>



</div>


</section>







{/* HOW RAW WORKS */}


<section

className="
px-10
py-20
"

>


<h2 className="
text-4xl
font-bold
text-center
">

How RAW Works

</h2>



<div className="
grid
md:grid-cols-3
gap-8
max-w-6xl
mx-auto
mt-12
">



<ProcessCard

icon={<Users/>}

title="Waste Generator"

text="Individuals and organizations list reusable materials."

/>



<ProcessCard

icon={<Truck/>}

title="Collector Network"

text="Collectors receive requests and recover materials."

/>



<ProcessCard

icon={<Factory/>}

title="Recycler"

text="Recovered resources return into the circular economy."

/>


</div>


</section>







{/* IMPACT */}


<section

id="impact"

className="
px-10
py-20
text-center
bg-white/5
"

>


<Leaf

size={60}

className="
mx-auto
text-emerald-400
"

/>



<h2 className="
text-4xl
font-bold
mt-6
">

Our Environmental Impact

</h2>




<p className="
mt-5
text-gray-400
max-w-4xl
mx-auto
text-lg
">

RAW reduces landfill dependency by connecting
waste generators with recycling networks.

</p>




<div className="
grid
md:grid-cols-3
gap-8
mt-12
">


<ImpactCard

number="2.24B"

title="Tonnes"

text="Global municipal waste generated annually"

/>



<ImpactCard

number="3.88B"

title="Tonnes"

text="Projected waste generation by 2050"

/>



<ImpactCard

number="100%"

title="Goal"

text="Every reusable material gets a second life"

/>


</div>


</section>







{/* FINAL CTA */}


<section className="
py-20
text-center
">


<h2 className="
text-5xl
font-bold
">

Ready to create a cleaner future?

</h2>



<p className="
mt-5
text-gray-400
text-xl
">

Join RAW and become part of the circular economy.

</p>




<Link

to="/auth/register"

className="
inline-block
mt-10
px-12
py-5
rounded-2xl
bg-emerald-500
font-bold
"

>

Join RAW

</Link>


</section>


</div>

);

}







function Card({

icon,
title,
text

}:any){

return (

<div className="
p-8
rounded-3xl
bg-white/5
border
border-white/10
hover:border-emerald-400
transition
">


<div className="
text-emerald-400
mb-5
">

{icon}

</div>


<h3 className="
text-2xl
font-bold
">

{title}

</h3>


<p className="
mt-4
text-gray-400
">

{text}

</p>


</div>

);

}







function VisionCard({

title,
text

}:any){

return (

<div className="
p-8
rounded-3xl
bg-[#0f172a]
border
border-white/10
">


<h3 className="
text-xl
font-bold
text-emerald-400
">

{title}

</h3>


<p className="
mt-4
text-gray-400
">

{text}

</p>


</div>

);

}







function ProcessCard({

icon,
title,
text

}:any){

return (

<div className="
p-8
rounded-3xl
bg-[#0f172a]
border
border-white/10
">


<div className="
text-emerald-400
mb-5
">

{icon}

</div>


<h3 className="
text-xl
font-bold
">

{title}

</h3>


<p className="
mt-4
text-gray-400
">

{text}

</p>


</div>

);

}







function ImpactCard({

number,
title,
text

}:any){

return (

<div className="
p-8
rounded-3xl
bg-black/30
border
border-white/10
">


<h3 className="
text-5xl
font-bold
text-emerald-400
">

{number}

</h3>


<p className="
mt-2
text-xl
font-bold
">

{title}

</p>


<p className="
mt-3
text-gray-400
">

{text}

</p>


</div>

);

}