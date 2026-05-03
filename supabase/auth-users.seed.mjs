export const DEV_AUTH_PASSWORD = "SkbhAdmin2026!";

export const authUsersSeed = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
    email: "sysadmin@skhotel.com.vn",
    password: DEV_AUTH_PASSWORD,
    appMetadata: {
      provider: "email",
      providers: ["email"],
      role: "system_admin",
      roles: ["system_admin"]
    },
    userMetadata: {
      full_name: "SK System Admin",
      locale: "vi"
    }
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
    email: "admin@skhotel.com.vn",
    password: DEV_AUTH_PASSWORD,
    appMetadata: {
      provider: "email",
      providers: ["email"],
      role: "admin",
      roles: ["admin"]
    },
    userMetadata: {
      full_name: "SK Admin",
      locale: "vi"
    }
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3",
    email: "manager@skhotel.com.vn",
    password: DEV_AUTH_PASSWORD,
    appMetadata: {
      provider: "email",
      providers: ["email"],
      role: "manager",
      roles: ["manager"]
    },
    userMetadata: {
      full_name: "SK Manager",
      locale: "vi"
    }
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4",
    email: "staff@skhotel.com.vn",
    password: DEV_AUTH_PASSWORD,
    appMetadata: {
      provider: "email",
      providers: ["email"],
      role: "staff",
      roles: ["staff"]
    },
    userMetadata: {
      full_name: "SK Staff",
      locale: "vi"
    }
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5",
    email: "member@skhotel.com.vn",
    password: DEV_AUTH_PASSWORD,
    appMetadata: {
      provider: "email",
      providers: ["email"],
      role: "member",
      roles: ["member"]
    },
    userMetadata: {
      full_name: "Demo Member",
      locale: "vi"
    }
  }
];

export const memberCustomerSeed = {
  id: "55555555-5555-5555-5555-555555555552",
  authUserId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5",
  email: "member@skhotel.com.vn",
  fullName: "Demo Member",
  phone: "+84 901 111 111",
  preferredLocale: "vi",
  marketingConsent: true,
  marketingConsentSource: "seed",
  source: "auth_seed",
  notes: "Seed row linked to the local member auth account."
};
