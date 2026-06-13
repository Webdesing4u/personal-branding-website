// Run with: npx prisma db seed
// Creates the admin user (bcrypt-hashed from env) + base categories + skills.

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');

  // ── Admin user (bcrypt cost 12) ──
  const passwordHash = await hash(password, 12);
  const admin = await db.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash },
    create: {
      fullName: 'Emran Hossain',
      email: email.toLowerCase(),
      passwordHash,
      role: 'admin',
    },
  });
  console.log(`✔ Admin user: ${admin.email}`);

  // ── Blog categories ──
  for (const name of ['Web Development', 'Digital Marketing', 'Entrepreneurship', 'Business Strategy']) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await db.blogCategory.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }

  // ── Portfolio categories ──
  for (const name of ['Web Development', 'Digital Marketing']) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await db.portfolioCategory.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }

  // ── Business categories ──
  for (const name of ['Startup', 'SaaS', 'Agency', 'E-commerce', 'Consulting']) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await db.businessCategory.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }

  // ── Skill categories + skills ──
  const skillData: Record<string, string[]> = {
    Frontend: ['React / Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    Backend: ['Node.js / Express', 'PostgreSQL / Prisma', 'REST & GraphQL APIs', 'AWS / Vercel / Docker'],
    Marketing: ['Meta & Google Ads', 'SEO & Content Strategy', 'Email Automation', 'Analytics & CRO'],
    'Business Strategy': ['Go-to-Market Planning', 'Product Strategy', 'Team Leadership', 'Financial Planning'],
  };

  let order = 0;
  for (const [catName, skills] of Object.entries(skillData)) {
    const existing = await db.skillCategory.findFirst({ where: { name: catName } });
    const cat =
      existing ??
      (await db.skillCategory.create({ data: { name: catName, displayOrder: order } }));
    order++;
    for (let i = 0; i < skills.length; i++) {
      const found = await db.skill.findFirst({ where: { name: skills[i], categoryId: cat.id } });
      if (!found) {
        await db.skill.create({
          data: { name: skills[i], categoryId: cat.id, displayOrder: i, level: 'expert' },
        });
      }
    }
  }

  console.log('✔ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
