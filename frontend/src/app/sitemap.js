export default function sitemap() {
  const baseUrl = 'https://thehometuitions.com';

  const subjects = [
    'maths', 'physics', 'chemistry', 'biology', 'english', 
    'hindi', 'science', 'commerce', 'accounts', 'coding'
  ];

  const classes = [
    'class-1','class-2','class-3','class-4','class-5','class-6',
    'class-7','class-8','class-9','class-10','class-11','class-12'
  ];

  const areas = [
    'gomti-nagar','aliganj','indira-nagar','hazratganj','rajajipuram',
    'alambagh','chinhat','vibhuti-khand','nirala-nagar','mahanagar',
    'jankipuram','sultanpur-road','faizabad-road','kursi-road',
    'telibagh','sushant-golf-city','kanpur-road','lucknow-cantonment',
    'aminabad','charbagh'
  ];

  const staticPages = [
    { url: `${baseUrl}/`, priority: 1.0, lastModified: new Date() },
    { url: `${baseUrl}/privacy-policy`, priority: 0.3, lastModified: new Date() },
    { url: `${baseUrl}/terms`, priority: 0.3, lastModified: new Date() },
  ];

  // 1. Subject only pages: /home-tutors/maths-tutor-lucknow
  const subjectPages = subjects.map(subject => ({
    url: `${baseUrl}/home-tutors/${subject}-tutor-lucknow`,
    priority: 0.8,
    changeFrequency: 'weekly',
  }));

  // 2. Subject + Class pages: /home-tutors/maths-tutor-class-10-lucknow
  const subjectClassPages = subjects.flatMap(subject =>
    classes.map(cls => ({
      url: `${baseUrl}/home-tutors/${subject}-tutor-${cls}-lucknow`,
      priority: 0.8,
      changeFrequency: 'weekly',
    }))
  );

  // 3. Subject + Class + Area pages: /home-tutors/maths-tutor-class-10-gomti-nagar-lucknow
  const subjectClassAreaPages = subjects.flatMap(subject =>
    classes.flatMap(cls =>
      areas.map(area => ({
        url: `${baseUrl}/home-tutors/${subject}-tutor-${cls}-${area}-lucknow`,
        priority: 0.8,
        changeFrequency: 'weekly',
      }))
    )
  );

  return [
    ...staticPages,
    ...subjectPages,
    ...subjectClassPages,
    ...subjectClassAreaPages,
  ];
}
