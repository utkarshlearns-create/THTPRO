export default function sitemap() {
  const baseUrl = 'https://www.thehometuitions.com';

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
    'jankipuram','sultanpur-road','faizabad-road','telibagh',
    'sushant-golf-city','aminabad','charbagh'
  ];

  const staticPages = [
    { url: `${baseUrl}/`, priority: 1.0, changeFrequency: 'daily' },
    { url: `${baseUrl}/login`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${baseUrl}/signup`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${baseUrl}/privacy-policy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: 'yearly' },
  ];

  // Subject only pages: /home-tutors/maths-tutor-lucknow
  const subjectPages = subjects.map(subject => ({
    url: `${baseUrl}/home-tutors/${subject}-tutor-lucknow`,
    priority: 0.9,
    changeFrequency: 'weekly',
  }));

  // Subject + class pages: /home-tutors/maths-tutor-class-10-lucknow
  const subjectClassPages = subjects.flatMap(subject =>
    classes.map(cls => ({
      url: `${baseUrl}/home-tutors/${subject}-tutor-${cls}-lucknow`,
      priority: 0.8,
      changeFrequency: 'weekly',
    }))
  );

  // Subject + class + area pages: /home-tutors/maths-tutor-class-10-gomti-nagar-lucknow
  const subjectClassAreaPages = subjects.flatMap(subject =>
    classes.flatMap(cls =>
      areas.map(area => ({
        url: `${baseUrl}/home-tutors/${subject}-tutor-${cls}-${area}-lucknow`,
        priority: 0.7,
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
