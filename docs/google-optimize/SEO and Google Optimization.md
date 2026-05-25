## **SEO and Google Optimization & Live Chat Integration Plan for SK Boutique Hotel** 

## **1. Overview of Repository** 

The SK Boutique Hotel web application is built using **Next.js 15** (App Router) with **React 19** and **TypeScript** . 

The frontend uses the **@supabase/ssr** and **@supabase/supabase-js** packages to interact with Supabase for data, authentication and realtime features. 

The project configuration is defined in `package.json` , which lists these dependencies, and 

`next.config.ts` which sets experimental features and image quality. 

The global metadata and fonts are defined in `app/layout.tsx` . For example, the layout sets the site title, description and Open Graph metadata, and defines the HTML language as Vietnamese. 

Evidence: 

- Dependencies such as Next.js, React, and Supabase are listed in `package.json` lines 13‑21 

> 1 . • `next.config.ts` shows allowed development origins and image quality settings 2 . • `app/layout.tsx` defines metadata and sets `<html lang="vi">` 3 . 

## **2. SEO and Google Tools Optimization** 

To ensure the website is discoverable and performs well on Google Search, Google Maps and other Google products, the source code should include the following features and implementations. 

## **2.1 robots.txt** 

Create a dynamic `robots.txt` route at **`app/robots.txt/route.ts`** (Next.js App Router). This route should return plain text that allows search engines to crawl the site while disallowing sensitive areas such as the admin portal. 

```
exportasyncfunctionGET(){
constcontent=`User-agent: *
Allow: /
Disallow: /admin
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`;
returnnewResponse(content,{headers:{'Content-Type':'text/
plain'}});
}
```

Ensure the `Sitemap` line points to your sitemap route defined below. 

1 

## **2.2 sitemap.xml** 

Implement a dynamic sitemap by adding a route at **`app/sitemap.xml/route.ts`** . The route should generate a list of URLs for all public pages: the home page, rooms, about‑us, contact, branch pages and any campaign landing pages. 

You can query Supabase or statically list slugs. Example: 

```
import{NextResponse}from'next/server';
import{listRoomTypes}from'@/lib/supabase/queries/room-types';
exportasyncfunctionGET(){
constrooms=awaitlistRoomTypes();
constbase=process.env.NEXT_PUBLIC_SITE_URL;
consturls=[
`${base}/`,
`${base}/rooms`,
`${base}/about-us`,
// add other static pages
];
rooms.forEach((rt)=>{
urls.push(`${base}/rooms/${rt.slug}`);
});
constbody=urls
.map((url)=>`<url><loc>${url}</loc><changefreq>weekly</
changefreq><priority>0.8</priority></url>`)
.join('');
constxml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://
www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
returnnewResponse(xml,{headers:{'Content-Type':'application/
xml'}});
}
```

## **2.3 Canonical URLs and Metadata** 

Update `app/layout.tsx` to include a canonical `<link>` tag pointing to the absolute URL of each page. 

You can compute this from `metadataBase` and the current pathname: 

```
exportconstmetadata:Metadata={
// existing fields…
other:{
canonical:(path:string)=>`${process.env.NEXT_PUBLIC_SITE_URL}${path}
`
,
},
};
exportdefaultfunctionRootLayout({children}:{children:ReactNode}){
constcanonicalUrl=metadata.other?.canonical?.(usePathname()??'/');
return(
```

2 

```
<htmllang="vi">
<head>
<linkrel="canonical"href={canonicalUrl}/>
{/* other head elements */}
</head>
<bodyclassName="site-body">{children}</body>
</html>
);
}
```

Use the `usePathname` hook from `next/navigation` to obtain the current path. Ensure that all pages define meaningful `title` and `description` metadata. Dynamic pages like `/rooms/[slug]` should implement a `generateMetadata` function to set title and description based on Supabase data. 

## **2.4 Structured Data (JSON‑LD)** 

Structured data helps Google understand your content. Embed JSON‑LD schemas in your pages using a custom component or within `layout.tsx` using `<script type="application/ld+json">` . 

At minimum, include the following schemas: 

- **Hotel/LocalBusiness** to describe the hotel’s name, address, contact details, geo coordinates and amenities. 

- **BreadcrumbList** to outline the navigation hierarchy. 

- • **WebSite** and **Organization** to reference the website and business. 

Example **Hotel** schema: 

```
{
"@context":"https://schema.org",
"@type":"Hotel",
"name":"SK Boutique Hotel Phú Quốc",
"url":"https://yourdomain.com",
"telephone":"+84 908233583",
"image":[
"https://yourdomain.com/images/hotel-front.jpg",
"https://yourdomain.com/images/room-family.jpg"
],
"address":{
"@type":"PostalAddress",
"streetAddress":"Khu nghỉ dưỡng phức hợp
Marina, MP-135, Marina Square, Ấp Đường Bào",
"addressLocality":"Phú Quốc",
"addressRegion":"Kiên Giang",
"postalCode":"92509",
"addressCountry":"VN"
},
"geo":{
"@type":"GeoCoordinates",
```

3 

```
"latitude":10.0000,
"longitude":103.0000
},
"amenityFeature":[
{"@type":"LocationFeatureSpecification","name":"Family Room",
"value":true},
{"@type":"LocationFeatureSpecification","name":"Superior Room",
"value":true},
{"@type":"LocationFeatureSpecification","name":"Quadruple Room",
"value":true}
]
}
```

Replace the latitude/longitude and image URLs with actual values from Google Maps and your image assets. 

## **2.5 Breadcrumb Structured Data** 

For pages deeper than one level (e.g. `/rooms/family-room` ), generate a **BreadcrumbList** JSON‑LD. Example: 

```
{
"@context":"https://schema.org",
"@type":"BreadcrumbList",
"itemListElement":[
{"@type":"ListItem","position":1,"name":"Trang chủ","item":
"https://yourdomain.com/"},
{"@type":"ListItem","position":2,"name":"Phòng","item":"https://
yourdomain.com/rooms"},
{"@type":"ListItem","position":3,"name":"Family Room","item":
"https://yourdomain.com/rooms/family-room"}
]
}
```

Implement this in the page’s `generateMetadata` function so each room page has its own breadcrumb structure. 

## **2.6 Core Web Vitals & Performance** 

Optimize your website for Core Web Vitals: **LCP < 2.5 s** , **INP < 200 ms** , and **CLS < 0.1** . Next.js can serve static content quickly, but you should also: 

- Use `next/image` for optimized images, with `sizes` and `priority` attributes for hero images. 

- Convert images to WebP/AVIF and enable lazy‑loading for gallery pictures. • Use font subsetting and host fonts locally (already done via `@fontsource` ). • Defer non‑critical scripts and load the chat widget code after the main content loads. 

These optimizations improve PageSpeed and search rankings. 

4 

## **2.7 Analytics and Conversion Tracking** 

Integrate **Google Tag Manager** (GTM) or **Google Analytics 4** (GA4) to track user behaviour and conversions. 

Add a `gtm.js` script in `<head>` using Next.js’s `next/script` component, and fire custom events for: 

- `page_view` : every page load. 

- 

- 

- `view_room` : user views a room detail. 

- `click_call` , `click_zalo` , `open_chat` : user interactions with call/Zalo/chat buttons. 

- `submit_contact_form` and `booking_request` : form submissions. 

For **Google Ads** , configure conversion events and import them into Ads Manager. 

Store `utm_source` , `utm_campaign` , `gclid` and `fbclid` in cookies or session storage and attach them to booking requests. 

## **2.8 Local SEO & Google Business Profile** 

Ensure that the hotel’s **name** , **address** and **phone number** (NAP) are consistent across the website and Google Business Profile. 

Embed a **Google Map** on the contact page with the hotel’s exact pin. 

Encourage guests to leave honest reviews on Google without offering incentives—Google’s policy prohibits offering vouchers or discounts in exchange for reviews. 

Instead, provide a simple thank‑you page after checkout with a link or QR code to the review form. 

## **3. Supabase Realtime Chat Integration** 

To provide realtime live chat between website visitors and hotel staff, implement a chat widget powered by **Supabase Realtime** . 

The architecture involves a `chat_conversations` table, a `chat_messages` table, a Supabase channel for realtime updates, and a Next.js component for the chat UI. 

## **3.1 Database Schema** 

Create these tables in Supabase: 

## **chat_conversations** 

- `id` (uuid, primary key, default uuid()) 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- `guest_name` (text) 

- `guest_phone` (text) 

- `guest_email` (text) 

- `guest_zalo` (text) 

- `checkin_date` (date) 

- `checkout_date` (date) 

- `guest_count` (integer) 

- `room_interest` (text) 

- `source_url` (text) 

- `utm_source` (text) 

- 

- `utm_campaign` (text) 

5 

- `status` (text, default 'new') 

- `assigned_to` (uuid) 

- `last_message_at` (timestamp with time zone) 

- `created_at` (timestamp with time zone, default now()) 

## **chat_messages** 

- `id` (uuid, primary key, default uuid()) 

- 

- 

- `conversation_id` (uuid, foreign key to chat_conversations.id) 

- `sender_type` (text, 'guest' | 'admin' | 'system') 

- `message` (text) 

- `created_at` (timestamp with time zone, default now()) 

- 

- `read_at` (timestamp with time zone) 

## **3.2 Supabase Client & Realtime Channel** 

Use the existing Supabase client ( `@supabase/ssr` or `@supabase/supabase-js` ) to initialize a realtime channel in your chat component: 

```
import{useEffect,useState}from'react';
import{createClient}from'@supabase/supabase-js';
constsupabase=createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
exportdefaultfunctionChatWidget(){
const[conversationId,setConversationId]=useState<string|null>(null);
const[messages,setMessages]=useState<any[]>([]);
const[message,setMessage]=useState('');
useEffect(()=>{
if(!conversationId)return;
constchannel=supabase
.channel(`chat:${conversationId}`)
.on('postgres_changes',{event:'INSERT',schema:'public',table:
'chat_messages',filter:`conversation_id=eq.${conversationId}`},(payload)
=>{
setMessages((prev)=>[...prev,payload.new]);
})
.subscribe();
return()=>{
channel.unsubscribe();
};
},[conversationId]);
constsendMessage=async()=>{
if(!conversationId){
// create conversation first
```

6 

```
const{data:conv,error}=awaitsupabase
.from('chat_conversations')
.insert({guest_name:'Khách',created_at:newDate()})
.select()
.single();
if(error)return;
setConversationId(conv.id);
}
awaitsupabase.from('chat_messages').insert({
conversation_id:conversationId,
sender_type:'guest',
message,
});
setMessage('');
};
return(
<divclassName="fixed bottom-4 right-4 p-4 bg-white shadow-lg rounded-lg
w-80">
<divclassName="h-60 overflow-y-auto mb-2">
{messages.map((m)=>(
<divkey={m.id}className={m.sender_type==='guest'?'text-
right':'text-left'}>{m.message}</div>
))}
</div>
<input
type="text"
value={message}
onChange={(e)=>setMessage(e.target.value)}
className="w-full border p-1 rounded"
placeholder="Nhập tin nhắn..."
/>
<buttononClick={sendMessage}className="mt-2 w-full bg-blue-500 text-
white py-1 rounded">
Gửi
</button>
</div>
);
}
```

This component subscribes to a Supabase realtime channel for the current conversation and appends new messages as they arrive. When a guest sends their first message, the conversation is created on the fly. You can extend this to collect guest details (name, phone, check‑in date) before creating the conversation. 

## **3.3 Admin Dashboard** 

Create an admin page (e.g. `/admin/chat` ) where staff can see active conversations, assign themselves, and reply in realtime. 

Use the same Supabase channel subscription to receive new messages from guests. For example, fetch all conversations with status 'new' or 'open' and display the latest message and time. 

7 

When an admin selects a conversation, open a chat panel similar to the guest widget, but set `sender_type` to `'admin'` when sending messages. 

Implement notifications (browser notifications, email or Telegram) when a new conversation is created or a guest is waiting without response for more than a few minutes. 

## **3.4 Deployment & Environment Variables** 

Store Supabase keys securely in `.env.local` : 

- 

- 

- `NEXT_PUBLIC_SUPABASE_URL` 

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 

- `SUPABASE_SERVICE_ROLE_KEY` (only used on the server when inserting conversations/ 

- messages) 

- 

- `NEXT_PUBLIC_SITE_URL` (your domain used for canonical URLs and sitemap) 

Make sure that server‑side functions use the service role key (never expose it client‑side). Run migrations to create the chat tables. In local development, execute SQL manually or use the Supabase CLI. 

Deploying to Vercel will automatically handle environment variables configured in the dashboard. 

## **4. Next Steps** 

Following this plan will improve your website’s visibility on Google and provide a better user experience. **Start by adding** **`robots.txt` and** **`sitemap.xml` routes** , then implement structured data and canonical tags. 

Next, **integrate GA4/GTM** and set up local SEO. 

Finally, **build and deploy the Supabase‑based realtime chat widget and admin dashboard** . 

Test thoroughly on staging before going live. 

> 1 package.json 

https://github.com/mbxhoan/sk-boutique-hotel/blob/main/package.json 

2 next.config.ts 

https://github.com/mbxhoan/sk-boutique-hotel/blob/main/next.config.ts 

> 3 layout.tsx 

https://github.com/mbxhoan/sk-boutique-hotel/blob/main/app/layout.tsx 

8 

