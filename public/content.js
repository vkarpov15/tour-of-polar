const content = [
  {
    text: `
<h1 class="text-xl mt-4 mb-2">Hello, World</h1>
<div class="flex flex-col gap-2">
  <p>Welcome to a tour of the <a class="text-indigo-500" href="https://www.osohq.com/docs/oss/reference/polar.html">Polar authorization language.</a></p>
  <p>The tour is divided into a list of modules that you can access by clicking on <a class="text-indigo-500">A Tour of Polar</a> on the top left of the page.</p>
  <p>You can also view the table of contents at any time by clicking on the menu on the top right of the page.</p>
  <p>Throughout the tour, you will find a series of slides and exercises to complete.</p>
</div>
    `,
    code: `
actor User {}
resource Organization {}

# Members can view organizations
has_permission(user: User, "view", organization: Organization) if
  has_role(user, "member", organization);

has_role(User{"alice"}, "member", Organization{"acme"});
    `,
    title: 'Hello, World',
    description: 'Learn how to use this tour'
  },


  {
    text: `
<h1 class="text-xl mt-4 mb-2">Basic Rules</h1>
<div class="flex flex-col gap-2">
  <p>Let's start with the basics of Polar rules and permissions.</p>
  <p>On the right you'll see an example of a simple policy that gives members viewing permissions on organizations.</p>
  <p>Try running the code to see how it works! You should see an assertion error. You can fix the assertion error by adding <pre>has_role(User{"alice"}, "member", Organization{"acme"});</pre></p>
</div>
    `,
    code: `
actor User {}
resource Organization {}

# Members can view organizations
has_permission(user: User, "view", organization: Organization) if
  has_role(user, "member", organization);

has_role(User{"alice"}, "member", Organization{"acme"});
    `,
    title: 'Basic Rules',
    description: 'Learn how to write simple rules and permissions in Polar'
  },


  {
    text: `
<h1 class="text-xl mt-4 mb-2">Role-Based Access Control (RBAC)</h1>
<div class="flex flex-col gap-2">
  <p>Roles are a widely-used approach to authorization, known as "role-based access control" or "RBAC". They help simplify authorization logic by grouping permissions that can be assigned to users.</p>
  <p>The code on the right demonstrates how to model RBAC in Polar. We've defined:</p>
  <ul class="list-disc ml-6">
    <li>Roles that inherit from each other (admin inherits member permissions)</li>
    <li>Permissions associated with roles (view and edit actions)</li>
    <li>Tests to verify the permissions work correctly</li>
  </ul>
  <p>Try running the tests to see how role inheritance works! The test should pass because admins inherit all member permissions.</p>
</div>
    `,
    code: `
actor User {}
resource Organization {}

# Members can view organizations
has_permission(user: User, "view", organization: Organization) if
  has_role(user, "member", organization);

# Admins can edit organizations
has_permission(user: User, "edit", organization: Organization) if
  has_role(user, "admin", organization);

# Admins inherit all permissions from members
has_role(user: User, "member", organization: Organization) if
  has_role(user, "admin", organization);

test "Alice can view Acme" {
  assert has_permission(User{"alice"}, "view", Organization{"acme"});
}
    `,
    title: 'Role-Based Access Control (RBAC)',
    description: 'Learn how to use roles to simplify your authorization logic'
  },
  {
    text: `
<h1 class="text-xl mt-4 mb-2">Relationship-Based Access Control (ReBAC)</h1>
<div class="flex flex-col gap-2">
  <p>Relationship-based access control (ReBAC) means organizing permissions based on relationships between resources. Let's look at a basic example involving groups and repositories.</p>
  <p>In the code on the right:</p>
  <ul class="list-disc ml-6">
    <li>Users can inherit roles from groups they belong to</li>
    <li>The Repository resource defines a reader role</li>
  </ul>
  <p>Try running the test to see how relationship inheritance works!</p>
</div>
    `,
    code: `
# user has role on resource if
has_role(user: User, role: String, resource: Resource) if
  # there exists a group
  group matches Group and
  # user is in the group
  has_group(user, group) and
  # the group has role on resource
  has_role(group, role, resource);

actor User { }

# A group is a kind of actor
actor Group { }

resource Repository {
  roles = ["reader"];
  permissions = ["read"];

  "read" if "reader";
}

# users inherit roles from groups
has_role(user: User, role: String, resource: Resource) if
  group matches Group and
  has_group(user, group) and
  has_role(group, role, resource);

test "group members can read repositories" {
  setup {
    has_role(Group{"anvil-readers"}, "reader", Repository{"anvil"});

    has_group(User{"alice"}, Group{"anvil-readers"});
    has_group(User{"bob"}, Group{"anvil-readers"});
    has_group(User{"charlie"}, Group{"anvil-readers"});
  }

  assert allow(User{"alice"}, "read", Repository{"anvil"});
  assert allow(User{"bob"}, "read", Repository{"anvil"});
  assert allow(User{"charlie"}, "read", Repository{"anvil"});
}
    `,
    title: 'Relationship-Based Access Control (ReBAC)',
    description: 'Learn how to organize permissions based on relationships between resources'
  },


  {
    text: `
<h1 class="text-xl mt-4 mb-2">Attribute-Based Access Control (ABAC)</h1>
<div class="flex flex-col gap-2">
  <p>Attribute-based access control (ABAC) encompasses any scenario where characteristics of a resource, user, or environment determine access. Let's look at one common pattern - public/private resources.</p>
  <p>In the code on the right:</p>
  <ul class="list-disc ml-6">
    <li>The Repository resource has a read permission</li>
    <li>We define a rule that allows anyone to read public repositories</li>
    <li>The test verifies that any user can read a public repository</li>
  </ul>
  <p>Try running the test to see how public repositories work!</p>
</div>
    `,
    code: `
actor User { }
resource Repository {
  permissions = ["read"];

  "read" if is_public(resource);
}

test "public repositories" {
  setup {
    is_public(Repository{"anvil"});
  }

  assert allow(User{"alice"}, "read", Repository{"anvil"});
}
    `,
    title: 'Attribute-Based Access Control (ABAC)',
    description: 'Learn how attributes and characteristics of resources control access to them'
  }
];
