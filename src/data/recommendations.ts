// Snapshot of the content served by the backend, refreshed by
// `npm run sync-content`. The app renders this until the API responds, and
// keeps it on screen if the API is unreachable — so edit content in the
// backend, not here.
import type { Recommendation } from '../types';

export const recommendations: Recommendation[] = [
  {
    id: "kritika",
    name: "Kritika Kharbanda",
    role: "Lead Sustainability Specialist @ Henning Larsen",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/kritika.webp",
    excerpt: "Anirudh is a pro-active and ambitious individual who is also innovative, and always eager to collaborate on new projects, and a pleasure to work with. I believe he would be a real asset",
    modal: {
      title: "Kritika Kharbanda",
      blocks: [
        { kind: 'image', src: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/kritika_recommendation.png" },
      ],
      link: { href: "https://www.linkedin.com/in/kritika-kharbanda-kritika/", label: "Contact Kritika" },
    },
  },
  {
    id: "gloria",
    name: "Gloria Henning",
    role: "Stacks Manager @ CMU Hunt Library",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/gloria_henning.webp",
    excerpt: "Anirudh approaches his work with a sense of maturity and professionalism. I feel that he possesses the knowledge, skills, and, most important, motivation necessary to succeed professionally.",
    modal: {
      title: "Gloria Henning",
      blocks: [
        { kind: 'image', src: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/gloria_recommendation.webp" },
      ],
      link: { href: "https://www.library.cmu.edu/about/people/gloria-henning", label: "Contact Gloria" },
    },
  },
  {
    id: "aaradhya-services",
    name: "Sachin Padgaonkar",
    role: "Proprietor of Aaradhya Services",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/aaradhya_logo_black_text_square.webp",
    excerpt: "I would like to recommend Mr. Anirudh Belwadi as a FULL STACK WEB DEVELOPER for Web Development of your organization. In his position as Web Developer, he worked for us in 2020. Anirudh did an excellent job in this position and was an asset for our organization. He has an excellent Web Development Skills and as well as Communication Skills and is extremely organized, can work independently, and is able to effectively multi-task to ensure that the project should complete in a proper time. Anirudh was always willing to offer his assistance. He would be an excellent asset to any employer and I recommend him for any endeavour he chooses to pursue.",
    modal: {
      title: "Aaradhya Services - Sachin Padgaonkar",
      blocks: [
        { kind: 'image', src: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/aaradhya_services_lor.webp", alt: "Aaradhya Services LOR - Sachin Padgaonkar" },
      ],
      link: { href: "https://aaradhya-services.github.io/website/", label: "Go to Website" },
    },
  },
  {
    id: "vikrant",
    name: "Vikrant Deshmukh",
    role: "Systems Process Specialist @ Genentech",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/vikrant.webp",
    excerpt: "Anirudh is a knowledgeable, articulate, and most dedicated professionals I've worked with. He was a Technical Team member of the IETE Student Chapter under my supervision as the chairperson. He was somebody that I trusted and looked toward for guidance and advice. Anirudh's significant contribution included organising a national-level workshop on ReactJS in collaboration with Sonny Sangha. He brings firm integrity and intelligence to his work. I believe his overall presence positively impacted the team and my individual experiences working there. As a leader, Anirudh earns my highest recommendation.",
    modal: {
      title: "Vikrant Deshmukh",
      blocks: [
        { kind: 'paragraph', text: "Anirudh is a knowledgeable, articulate, and most dedicated professionals I've worked with. He was a Technical Team member of the IETE Student Chapter under my supervision as the chairperson. He was somebody that I trusted and looked toward for guidance and advice. Anirudh's significant contribution included organising a national-level workshop on ReactJS in collaboration with Sonny Sangha. He brings firm integrity and intelligence to his work. I believe his overall presence positively impacted the team and my individual experiences working there. As a leader, Anirudh earns my highest recommendation." },
      ],
      link: { href: "https://www.linkedin.com/in/vikrant-deshmukh/", label: "Contact Vikrant" },
    },
  },
  {
    id: "dinesh",
    name: "Dinesh Pothedar",
    role: "Founder and CEO @ VaN-A-NiR",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/dinesh.webp",
    excerpt: "I got a lot to learn from The web development bootcamp at Team Full Stack, I highly recommend Anirudh for his skills in different programming languages. He has good knowledge of web development, he helped me understanding the Web Development to the Core. He does things in a structured way so nobody gets left off.",
    modal: {
      title: "Dinesh Pothedar",
      blocks: [
        { kind: 'paragraph', text: "I got a lot to learn from The web development bootcamp at Team Full Stack, I highly recommend Anirudh for his skills in different programming languages. He has good knowledge of web development, he helped me understanding the Web Development to the Core. He does things in a structured way so nobody gets left off." },
      ],
      link: { href: "https://www.linkedin.com/in/dinesh-pothedar-045b43112/", label: "Contact Dinesh" },
    },
  },
  {
    id: "geeta",
    name: "Geeta Seshapalli",
    role: "SDE @ Torq Commodities",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/geeta.webp",
    excerpt: "He is one of the most dedicated professionals I've worked with and is willing to put that extra help whenever needed. His expertise as a developer is considerable, and it helped our team come up with more efficient solutions on different projects. His ability to go out of his way to help others has made him stand out. Any organization would be lucky to have Anirudh as their member. He will be a valuable asset to any organization. Anirudh would become an appreciated member of any team.",
    modal: {
      title: "Geeta Seshapalli",
      blocks: [
        { kind: 'paragraph', text: "He is one of the most dedicated professionals I've worked with and is willing to put that extra help whenever needed. His expertise as a developer is considerable, and it helped our team come up with more efficient solutions on different projects. His ability to go out of his way to help others has made him stand out. Any organization would be lucky to have Anirudh as their member. He will be a valuable asset to any organization. Anirudh would become an appreciated member of any team." },
      ],
      link: { href: "https://www.linkedin.com/in/geetaseshapalli/", label: "Contact Geeta" },
    },
  },
  {
    id: "aishwarya",
    name: "Aishwarya Ganeshan",
    role: "Senior Consultant @ GEP Worldwide",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/aishwarya.webp",
    excerpt: "Anirudh Srinath Belwadi is a very active and diligent person. He's always been a valuable member of the team. In his future undertakings, I wish him all the best in his future endeavors.",
    modal: {
      title: "Aishwarya Ganeshan",
      blocks: [
        { kind: 'paragraph', text: "Anirudh Srinath Belwadi is a very active and diligent person. He's always been a valuable member of the team. In his future undertakings, I wish him all the best in his future endeavors." },
      ],
      link: { href: "https://www.linkedin.com/in/aishwarya-ganeshan/", label: "Contact Aishwarya" },
    },
  },
  {
    id: "kartik",
    name: "Kartik Sharma",
    role: "Student in Full Stack Development Bootcamp in Team FullStack",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/kartik.webp",
    excerpt: "The web development bootcamp at Team Full Stack, where Anirudh is a founder, is where it all started. I discovered that he has fairly exceptional technical and communication skills while he was a senior in college. In the bootcamp, Anirudh assisted me in developing my fundamental Full Stack development skills. He is always willing to support me in both my professional and academic endeavours. I strongly recommend Anirudh and can attest that he will be a great asset to any company.",
    modal: {
      title: "Kartik Sharma",
      blocks: [
        { kind: 'paragraph', text: "The web development bootcamp at Team Full Stack, where Anirudh is a founder, is where it all started. I discovered that he has fairly exceptional technical and communication skills while he was a senior in college. In the bootcamp, Anirudh assisted me in developing my fundamental Full Stack development skills. He is always willing to support me in both my professional and academic endeavours. I strongly recommend Anirudh and can attest that he will be a great asset to any company." },
      ],
      link: { href: "https://www.linkedin.com/in/kartik-sharma-a20114241/", label: "Contact Kartik" },
    },
  },
  {
    id: "pranav",
    name: "Pranav Powar",
    role: "Student in Full Stack Development Bootcamp in Team FullStack",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/pranav.webp",
    excerpt: "I have no hesitation in recommending Anirudh for any role or project, as they are a consummate professional who always strives for excellence. He has a fantastic personality and an extraordinary approach to solving any situation.",
    modal: {
      title: "Pranav Powar",
      blocks: [
        { kind: 'paragraph', text: "I have no hesitation in recommending Anirudh for any role or project, as they are a consummate professional who always strives for excellence. He has a fantastic personality and an extraordinary approach to solving any situation." },
      ],
      link: { href: "https://www.linkedin.com/in/pranav-powar/", label: "Contact Pranav" },
    },
  },
  {
    id: "sharan",
    name: "Sharan Murli",
    role: "Software Engineer @ CertiNext Inc.",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/sharan.webp",
    excerpt: "Anirudh is a respectful and kind person who has been excellent in academics and extra-curricular activities since our first year of Engineering. Being an exceptional guide, Anirudh's Full-Stack Development knowledge and Framework building skills have helped me enhance my web development skills. Anirudh and I have had the opportunity to work together on several technical events and workshops. During these events, Anirudh has demonstrated his expertise and leadership skills by mentoring participants, providing guidance on complex technical issues, and sharing his knowledge of the latest technological trends and innovations. Anirudh's exceptional skills & abilities make him an asset to any organization looking to build a strong and successful team.",
    modal: {
      title: "Sharan Murli",
      blocks: [
        { kind: 'paragraph', text: "Anirudh is a respectful and kind person who has been excellent in academics and extra-curricular activities since our first year of Engineering. Being an exceptional guide, Anirudh's Full-Stack Development knowledge and Framework building skills have helped me enhance my web development skills. Anirudh and I have had the opportunity to work together on several technical events and workshops. During these events, Anirudh has demonstrated his expertise and leadership skills by mentoring participants, providing guidance on complex technical issues, and sharing his knowledge of the latest technological trends and innovations. Anirudh's exceptional skills & abilities make him an asset to any organization looking to build a strong and successful team." },
      ],
      link: { href: "https://www.linkedin.com/in/sharan-murli/", label: "Contact Sharan" },
    },
  },
  {
    id: "kaustubh",
    name: "Kaustubh Patil",
    role: "Software Developer @ VenturEd Solutions",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/kaustubh.webp",
    excerpt: "I met Anirudh at a web development Bootcamp and we collaborated on a few projects together. The amount of knowledge and confidence he possessed in Web development, particularly in Flask, surpassed all expectations. He inspired everyone in the bootcamp as he generously assisted others in mastering these fundamental skills. Beyond the Bootcamp, I had the opportunity to work with Anirudh at Team Full Stack on various freelance projects. As an exceptional leader, he guided me adeptly during my early stages of working on real projects. His teaching skills not only facilitated my learning of Flask but also inspired me to share my knowledge of Web Development with other students for a meaningful Cause. Anirudh is a true gem as a leader, developer, and teacher, and his humble nature makes him a pleasure to collaborate and grow with.",
    modal: {
      title: "Kaustubh Patil",
      blocks: [
        { kind: 'paragraph', text: "I met Anirudh at a web development Bootcamp and we collaborated on a few projects together. The amount of knowledge and confidence he possessed in Web development, particularly in Flask, surpassed all expectations. He inspired everyone in the bootcamp as he generously assisted others in mastering these fundamental skills." },
        { kind: 'paragraph', text: "Beyond the bootcamp, I had the opportunity to work with Anirudh at Team Full Stack on various freelance projects. As an exceptional leader, he guided me adeptly during my early stages of working on real projects. His teaching skills not only facilitated my learning of Flask but also inspired me to share my knowledge of Web Development with other students for a meaningful Cause." },
        { kind: 'paragraph', text: "Anirudh is a true gem as a leader, developer, and teacher, and his humble nature makes him a pleasure to collaborate and grow with." },
      ],
      link: { href: "https://www.linkedin.com/in/kaustubh-patil-532325171/", label: "Contact Kaustubh" },
    },
  },
  {
    id: "vedant",
    name: "Vedant Bhalwatkar",
    role: "Global Artwork Excellence Specialist @ Unilever",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/vedant.webp",
    excerpt: "Anirudh is a self-starter who is never afraid to take on new challenges. I know him since 1st year of engineering where he was actively involved in all the curricular & extracurricular activities. He is an all-rounder boy & possesses a rare combination of strong technical skills, exceptional problem-solving abilities, and excellent interpersonal & Photographic skills. Always willing to go the extra mile is his habit. What sets Anirudh apart is his ability to learn quickly and adapt to new situations. He also has the contributor & giving back factor wherever he goes. Winning the “GSTian of the Year” award in the college was the cherry on the cake for him. He has always amazed me with his progress, simplicity, and class. I highly recommend him for any team.",
    modal: {
      title: "Vedant Bhalwatkar",
      blocks: [
        { kind: 'paragraph', text: "Anirudh is a self-starter who is never afraid to take on new challenges. I know him since 1st year of engineering where he was actively involved in all the curricular & extracurricular activities. He is an all-rounder boy & possesses a rare combination of strong technical skills, exceptional problem-solving abilities, and excellent interpersonal & Photographic skills. Always willing to go the extra mile is his habit. What sets Anirudh apart is his ability to learn quickly and adapt to new situations. He also has the contributor & giving back factor wherever he goes." },
        { kind: 'paragraph', text: "Winning the “GSTian of the Year” award in the college was the cherry on the cake for him. He has always amazed me with his progress, simplicity, and class. I highly recommend him for any team." },
      ],
      link: { href: "https://www.linkedin.com/in/vedant-bhalwatkar/", label: "Contact Vedant" },
    },
  },
  {
    id: "gaurang",
    name: "Gaurang Keluskar",
    role: "Software Developer @ Cogitate",
    avatar: "https://anirudhbelwadiportfolio.pythonanywhere.com/content/images/recommendations/gaurang.webp",
    excerpt: "I highly recommend Anirudh for his skills in different programming languages. He has good knowledge of web development, I have no doubt that he will be a valuable asset to any team or organization.",
    modal: {
      title: "Gaurang Keluskar",
      blocks: [
        { kind: 'paragraph', text: "I highly recommend Anirudh for his skills in different programming languages. He has good knowledge of web development, I have no doubt that he will be a valuable asset to any team or organization." },
      ],
      link: { href: "https://www.linkedin.com/in/gaurang-keluskar/", label: "Contact Gaurang" },
    },
  },
];
