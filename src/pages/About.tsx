import { useState } from 'react';
import { Target, Eye, Users, Lightbulb, Heart, Code, Server, Layers, Smartphone, PenTool, Brain, Database, Shield, Cpu, Cloud, Gamepad, Globe, Megaphone, Edit, Film } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from curriculum design to student support.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We embrace cutting-edge technologies and innovative teaching methods to stay ahead.'
    },
    {
      icon: Heart,
      title: 'Care',
      description: 'We genuinely care about each intern\'s growth and success in their career journey.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We build a strong community of learners, mentors, and industry professionals.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: '15+ years in tech education and startup mentoring'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Former Google engineer with expertise in AI and machine learning'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Programs',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Curriculum designer with 10+ years in tech training'
    },
    {
      name: 'David Kim',
      role: 'Industry Relations',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Connects our interns with top tech companies worldwide'
    }
  ];

  const domains = [
    {
      name: 'Frontend Development',
      description: 'Mastering the art of creating intuitive and responsive user interfaces using modern frameworks like React, Vue, and Angular.',
      color: 'bg-blue-50 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400',
      icon: Code
    },
    {
      name: 'Backend Development',
      description: 'Building robust server-side applications and APIs using technologies like Node.js, Python, and Java.',
      color: 'bg-green-50 dark:bg-green-800/50 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400',
      icon: Server
    },
    {
      name: 'Full-Stack Development',
      description: 'Combining frontend and backend skills to create comprehensive, end-to-end web applications.',
      color: 'bg-purple-50 dark:bg-purple-800/50 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400',
      icon: Layers
    },
    {
      name: 'App Development',
      description: 'Developing mobile applications for iOS and Android using frameworks like Flutter and React Native.',
      color: 'bg-yellow-50 dark:bg-yellow-800/50 border-yellow-200 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400',
      icon: Smartphone
    },
    {
      name: 'UI/UX Design',
      description: 'Crafting user-centered designs with a focus on usability, aesthetics, and accessibility.',
      color: 'bg-pink-50 dark:bg-pink-800/50 border-pink-200 dark:border-pink-700 text-pink-600 dark:text-pink-400',
      icon: PenTool
    },
    {
      name: 'Machine Learning / AI',
      description: 'Implementing intelligent systems and predictive models using TensorFlow, PyTorch, and other ML frameworks.',
      color: 'bg-red-50 dark:bg-red-800/50 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400',
      icon: Brain
    },
    {
      name: 'Data Science',
      description: 'Analyzing and visualizing data to uncover insights using tools like Python, R, and Tableau.',
      color: 'bg-teal-50 dark:bg-teal-800/50 border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400',
      icon: Database
    },
    {
      name: 'Cybersecurity',
      description: 'Protecting systems and networks from threats through ethical hacking, penetration testing, and security protocols.',
      color: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400',
      icon: Shield
    },
    {
      name: 'IoT & Embedded Systems',
      description: 'Designing and programming connected devices and embedded systems for smart applications.',
      color: 'bg-orange-50 dark:bg-orange-800/50 border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400',
      icon: Cpu
    },
    {
      name: 'Cloud & DevOps',
      description: 'Managing cloud infrastructure and CI/CD pipelines using AWS, Azure, Docker, and Kubernetes.',
      color: 'bg-indigo-50 dark:bg-indigo-800/50 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400',
      icon: Cloud
    },
    {
      name: 'Game Development',
      description: 'Creating immersive games using engines like Unity and Unreal Engine with C# and C++.',
      color: 'bg-lime-50 dark:bg-lime-800/50 border-lime-200 dark:border-lime-700 text-lime-600 dark:text-lime-400',
      icon: Gamepad
    },
    {
      name: 'Web3 / Blockchain',
      description: 'Building decentralized applications and smart contracts using Ethereum, Solidity, and IPFS.',
      color: 'bg-cyan-50 dark:bg-cyan-800/50 border-cyan-200 dark:border-cyan-700 text-cyan-600 dark:text-cyan-400',
      icon: Globe
    },
    {
      name: 'Digital Marketing',
      description: 'Driving online growth through SEO, social media marketing, and content strategies.',
      color: 'bg-rose-50 dark:bg-rose-800/50 border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400',
      icon: Megaphone
    },
    {
      name: 'Content Creation / Blogging',
      description: 'Producing engaging written and visual content to build brand presence and audience engagement.',
      color: 'bg-amber-50 dark:bg-amber-800/50 border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-400',
      icon: Edit
    },
    {
      name: 'Video Editing & Motion Design',
      description: 'Creating compelling video content and animations using tools like Adobe Premiere and After Effects.',
      color: 'bg-violet-50 dark:bg-violet-800/50 border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400',
      icon: Film
    }
  ];

  const [hoveredDomain, setHoveredDomain] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Green Thicks
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Fresh From Farm To Table - Nurturing Tomorrow's Tech Leaders
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                To bridge the gap between academic learning and industry requirements by providing 
                comprehensive, hands-on internship programs that prepare students for successful 
                careers in technology. We believe in nurturing talent from the ground up, just like 
                fresh produce from farm to table.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <Eye className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                To become the leading platform for tech internships globally, where every aspiring 
                developer, designer, and tech professional can find the guidance, resources, and 
                opportunities they need to thrive in the digital economy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Founded in 2025, Green Thicks emerged from a simple observation: there was a significant 
                gap between what students learned in universities and what the tech industry actually needed. 
                Our founders, having worked in both academia and industry, recognized the need for a bridge 
                that could help students transition smoothly into professional roles.
              </p>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                The name "Green Thicks" reflects our philosophy of organic growth and sustainable learning. 
                Just as fresh produce travels from farm to table, we believe in nurturing raw talent and 
                helping it flourish into industry-ready skills. Our "Fresh From Farm To Table" motto 
                embodies our commitment to authentic, practical learning experiences.
              </p>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Today, we've helped interns launch their careers, with a 95% success rate in 
                job placements. Our programs span multiple domains including Frontend Development, 
                Backend Development, AI & Machine Learning, Data Science, and more. Each intern receives 
                personalized mentorship, hands-on project experience, and industry-recognized certification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Certification Process</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Secure and verifiable credentials for our interns' achievements
            </p>
          </div>
          
          <div className="space-y-12">
            {/* Digital Certificate */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="lg:w-1/2">
                  <img
                    src="/demo-certificate.png"
                    alt="Demo Certificate"
                    className="w-full rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="lg:w-1/2 text-center lg:text-left">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Digital Certificate</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    Each intern receives a digital certificate featuring a unique QR code, ensuring authenticity and easy verification of their achievements.
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Page Showcase */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col lg:flex-row-reverse items-center gap-8">
                <div className="lg:w-1/2">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                    src="/demo.mp4"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="lg:w-1/2 text-center lg:text-left">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Verification Page Showcase</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
                    Scanning the QR code leads to a dedicated verification page displaying the intern’s profile, completed domains, project links, and video demonstrations.
                  </p>
                  <a
                    href="https://careers.greenthicks.live/verify/105845"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200"
                  >
                    Verify Certificate (ID: 105845)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Training Domains</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore our comprehensive programs across multiple technology domains
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredDomain(index)}
                onMouseLeave={() => setHoveredDomain(null)}
                onClick={() => setHoveredDomain(hoveredDomain === index ? null : index)}
              >
                <div className={`${domain.color} rounded-lg p-4 text-center border shadow-sm transition-all duration-300 group-hover:shadow-md`}>
                  <div className="flex items-center justify-center gap-2">
                    <domain.icon className="w-6 h-6" />
                    <h3 className={`text-lg font-medium ${domain.color.split(' ')[2] || 'text-gray-900 dark:text-white'}`}>
                      {domain.name}
                    </h3>
                  </div>
                </div>
                {hoveredDomain === index && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div
                      className="relative rounded-xl p-6 border border-gray-700 shadow-xl z-10 transition-all duration-300 transform scale-100 bg-black text-white"
                    >
                      <div className="flex items-start space-x-4">
                        <domain.icon className="w-10 h-10 flex-shrink-0 text-white opacity-90" />
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{domain.name}</h3>
                          <p className="text-sm opacity-80">{domain.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              The passionate individuals behind Green Thicks
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-green-600 dark:text-green-400 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> 
       */}
      
{/* 
<section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">Interns Trained</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-green-100">Job Placement Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-green-100">Partner Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-green-100">Student Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
*/}
      
      
    </div>
  );
};

export default About;