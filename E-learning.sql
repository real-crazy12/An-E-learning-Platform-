CREATE DATABASE elearning;
USE elearning;
CREATE TABLE course(
id INT AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(255),
description TEXT,
lectures INT,
rating FLOAT
);

INSERT INTO courses (title,description,lectures,rating)
VALUES
("Web Design & Development", "Learn HTML, CSS, and JavaScript",11,4.5),
("Learn UX/UI Design","Explore the principles of user experience and user interface design.",11,4.0),
("Learn Python for Data Science", "Explore the principles of user experience and user interface design.",21,5.0),
("Machine Learning","Master the concepts of machine learning, data science, and deep learning.",25,3.5),
("Graphic Designing","Develop your creative skills and learn the fundamentals of graphic design. ",15,4.5),
("PHP with - CMS Project","Learn PHP to Develop Dynamic Web Applications. Understand the basics of server-side scripting, form handling, and database interactions",20,3.0),
("Bootstrap 5 From Scratch","Master Bootstrap to Create Responsive Web Designs",10,3.5),
("Internet of Things","Explore the innovative world of IoT. Learn to connect devices, collect data, and implement IoT solutions that improve efficiency, productivity, and connectivity in various industries",27,4.0),
("Learning with React-Native","Master React to Build Dynamic Web Applications. Learn about components, state management, and hooks to create interactive and efficient user interfaces with React.",16,4.5),
("Business Fundamental","Essential business concepts in marketing, finance, accounting, and management",14,3.5),
("Management and Leadership","Organizational behavior, leadership styles & effective management styles.",16,4.5),
("Marketing & Consumer Pattern","Marketing strategies, market research, and consumer psychology.",21,4.5),
("Corporate Social Responsibility","Ethical dilemmas in business and positive organizational service to society.",10,3.0),
("Human Resource Management","Recruitment, employee relations & compensation.",12,4.5),
("Strategic Management","Long-term planning, competitive analysis, and business growth strategies.",13,5.0),
("Operations Management","Streamlining workflows and resources for smooth operations.",12,4.0),
("Public Administration","Insights into public sector management with courses like "Research Methods".",11,4.5),
("Principles of Public Relations","Provides an overview of PR principles and theories relevant to practice, including the field's origin, trends, and how to land a job in public relations.",14,3.5),
("PR Research and Measurement","Understand methods for researching public opinion, measuring PR campaign effectiveness, and using data to inform PR strategies.",16,4.0),
("Crisis Communication","Explore strategies for managing communication during crises, including damage control and maintaining public trust.",12,4.0),
("Digital and Social Media PR","Understand how to leverage digital platforms and social media for public relations campaigns.",21,4.5),
("PR Writing","Develop writing skills for various PR materials such as press releases, speeches, and newsletters",10,3.0),
("Corporate Communication","Study internal and external communication strategies within organizations",12,4.5),
("Event Planning & Management","Learn how to plan, organize, and execute events that support public relations objectives.",13,5.0),
("Media Relations","Learn how to effectively communicate with the media, manage press releases, and handle media inquiries",12,4.0),
("International Public Relations","Explore PR practices in a global context, including cultural considerations and international communication strategies.",11,4.5),
("Real Estate Principles","Fundamental concepts and principles of real estate.",14,3.5),
("Property Management","Managing residential and commercial properties.",16,4.5),
("Real Estate Finance","Financing methods, mortgage markets, and investment analysis.",12,4.0),
("Real Estate Law","Legal aspects of real estate transactions and property rights.",21,4.0);
("Real Estate Marketing","Strategies for marketing real estate properties and services.",10,3.0),
("Urban Planning & Development","Planning and development of urban areas and real estate projects.",12,4.5),
("Real Estate Appraisal","Methods for property valuation and market analysis.",13,4.0),
("Commercial Real Estate","Specialization in commercial property management and transactions.",12,4.0);
("Ethics in Real Estate","Ethical considerations and professional standards in the real estate industry.",11,4.5)
