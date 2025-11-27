import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const skills = [
  // プログラミング言語
  { name: 'Java', category: 'プログラミング言語' },
  { name: 'C#', category: 'プログラミング言語' },
  { name: 'Python', category: 'プログラミング言語' },
  { name: 'VB.NET', category: 'プログラミング言語' },
  { name: 'TypeScript', category: 'プログラミング言語' },
  { name: 'JavaScript', category: 'プログラミング言語' },
  { name: 'PHP', category: 'プログラミング言語' },
  { name: 'Ruby', category: 'プログラミング言語' },
  { name: 'Go', category: 'プログラミング言語' },
  { name: 'Kotlin', category: 'プログラミング言語' },
  { name: 'Swift', category: 'プログラミング言語' },
  { name: 'C++', category: 'プログラミング言語' },
  { name: 'C', category: 'プログラミング言語' },
  { name: 'Scala', category: 'プログラミング言語' },
  { name: 'Rust', category: 'プログラミング言語' },

  // データベース
  { name: 'MySQL', category: 'データベース' },
  { name: 'Oracle', category: 'データベース' },
  { name: 'PostgreSQL', category: 'データベース' },
  { name: 'SQL Server', category: 'データベース' },
  { name: 'DB2', category: 'データベース' },
  { name: 'MongoDB', category: 'データベース' },
  { name: 'Redis', category: 'データベース' },
  { name: 'Cassandra', category: 'データベース' },
  { name: 'DynamoDB', category: 'データベース' },
  { name: 'Elasticsearch', category: 'データベース' },

  // フレームワーク
  { name: 'Spring', category: 'フレームワーク' },
  { name: 'Spring Boot', category: 'フレームワーク' },
  { name: 'Struts', category: 'フレームワーク' },
  { name: '.NET Framework', category: 'フレームワーク' },
  { name: '.NET Core', category: 'フレームワーク' },
  { name: 'ASP.NET', category: 'フレームワーク' },
  { name: 'React', category: 'フレームワーク' },
  { name: 'Vue.js', category: 'フレームワーク' },
  { name: 'Angular', category: 'フレームワーク' },
  { name: 'Next.js', category: 'フレームワーク' },
  { name: 'Nuxt.js', category: 'フレームワーク' },
  { name: 'Django', category: 'フレームワーク' },
  { name: 'Flask', category: 'フレームワーク' },
  { name: 'FastAPI', category: 'フレームワーク' },
  { name: 'Ruby on Rails', category: 'フレームワーク' },
  { name: 'Laravel', category: 'フレームワーク' },
  { name: 'Express.js', category: 'フレームワーク' },
  { name: 'NestJS', category: 'フレームワーク' },

  // クラウド・インフラ
  { name: 'AWS', category: 'クラウド・インフラ' },
  { name: 'Azure', category: 'クラウド・インフラ' },
  { name: 'GCP', category: 'クラウド・インフラ' },
  { name: 'Docker', category: 'クラウド・インフラ' },
  { name: 'Kubernetes', category: 'クラウド・インフラ' },
  { name: 'Terraform', category: 'クラウド・インフラ' },
  { name: 'Ansible', category: 'クラウド・インフラ' },
  { name: 'Jenkins', category: 'クラウド・インフラ' },
  { name: 'CircleCI', category: 'クラウド・インフラ' },
  { name: 'GitHub Actions', category: 'クラウド・インフラ' },

  // OS・サーバー
  { name: 'Linux', category: 'OS・サーバー' },
  { name: 'Windows Server', category: 'OS・サーバー' },
  { name: 'Ubuntu', category: 'OS・サーバー' },
  { name: 'CentOS', category: 'OS・サーバー' },
  { name: 'Red Hat', category: 'OS・サーバー' },
  { name: 'Apache', category: 'OS・サーバー' },
  { name: 'Nginx', category: 'OS・サーバー' },
  { name: 'Tomcat', category: 'OS・サーバー' },

  // ツール・その他
  { name: 'Git', category: 'ツール・その他' },
  { name: 'GitHub', category: 'ツール・その他' },
  { name: 'GitLab', category: 'ツール・その他' },
  { name: 'Bitbucket', category: 'ツール・その他' },
  { name: 'JIRA', category: 'ツール・その他' },
  { name: 'Confluence', category: 'ツール・その他' },
  { name: 'Slack', category: 'ツール・その他' },
  { name: 'Figma', category: 'ツール・その他' },
  { name: 'Adobe XD', category: 'ツール・その他' },
  { name: 'Photoshop', category: 'ツール・その他' },
  { name: 'Illustrator', category: 'ツール・その他' },
]

async function main() {
  console.log('Start seeding skills...')

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
