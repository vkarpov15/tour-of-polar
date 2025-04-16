const content = [
  {
    text: `
<h1 class="text-xl mt-4 mb-2">Getting Started</h1>
<div>
  <div class="float-left mr-4">
    <img class="w-48 inline rounded-md shadow-md dark:border dark:border-gray-700" src="https://meanitsoftware.s3.us-east-1.amazonaws.com/bear1.png" />
  </div>
  <p>Welcome to a tour of the <a class="text-indigo-500" href="https://www.osohq.com/docs/oss/reference/polar.html">Polar authorization language.</a></p>
  <p class="mt-2">The tour is divided into a list of modules that you can access by clicking on <a class="text-indigo-500">A Tour of Polar</a> on the top left of the page.</p>
  <p class="mt-2">You can also view the table of contents at any time by clicking on the menu on the top right of the page.</p>
  <p class="mt-2">Throughout the tour, you will find a series of slides and exercises to complete.</p>
  <p class="mt-2">You can use the following keyboard shortcuts:</p>
  <ul class="list-disc list-inside mt-2">
    <li><code>Shift+Enter</code>: Run code</li>
    <li><code>Page Up</code>: Previous page</li>
    <li><code>Page Down</code>: Next page</li>
  </ul>
  <p class="mt-2">The code on the right contains a Polar policy. Polar is declarative language designed to express authorization logic in a readable, rule-based format.</p>
  <p class="mt-2">Polar authorization requests typically take the form "Can this actor perform some action on this resource?" The code on the right contains a minimal policy which indicates that users can read organizations if they are an admin.</p>
  <p class="mt-2">Click "Run" to execute the authorization query with the provided policy. You should see "Result: allowed" in the results panel once the policy has been run, which means the authorization query succeeded.</p>
</div>
    `,
    code: `
actor User {}
resource Organization {
  permissions = ["read"];
  roles = ["admin"];

  "read" if "admin";
}
    `,
    authorizeQuery: 'User:alice read Organization:acme',
    contextFacts: [
      ['has_role', { type: 'User', id: 'alice' }, 'admin', { type: 'Organization', id: 'acme' }]
    ],
    title: 'Getting Started',
    description: 'Learn how to use this tour',
    chapter: 'Basics'
  },


  {
    text: `
<h1 class="text-xl mt-4 mb-2">Basic Rules</h1>
<div class="flex flex-col gap-2">
<p>Now that you've seen how to define resources in Polar, let's learn how roles and permissions work together in a Polar policy.</p>
<p>
  The code on the right demonstrates a common pattern - an Item resource that has:
</p>
<ul class="list-disc list-inside">
  <li>Defined roles (viewer, owner)</li>
  <li>Defined permissions (view, edit)</li>
  <li>Rules mapping roles to permissions</li>
</ul>
<p>This introduces two key concepts - using roles to group related permissions, and defining rules to determine when permissions are granted.</p>
<p>Try running the code! You should see that the policy executed successfully.</p>
</div>
    `,
    code: `
actor User {}
resource Item {
  roles = ["viewer", "owner"];
  permissions = ["view", "edit"];

  "view" if "viewer";
  "edit" if "owner";
  "viewer" if "owner";
}
    `,
    authorizeQuery: 'User:alice view Item:test',
    contextFacts: [
      ['has_role', { type: 'User', id: 'alice' }, 'owner', { type: 'Item', id: 'test' }],
      ['has_role', { type: 'User', id: 'bob' }, 'viewer', { type: 'Item', id: 'test' }]
    ],
    title: 'Basic Rules',
    description: 'Learn how to write simple rules and permissions in Polar',
    chapter: 'Basics'
  },


  {
      title: 'Resource-Specific Roles',
      description: 'Learn how to implement fine-grained access control with resource-specific roles',
      chapter: 'Role-Based Access Control (RBAC)',
      text: `
  <h1 class="text-xl mt-4 mb-2">Role-Based Access Control: Resource-Specific Roles</h1>
  <div>
    <div class="float-left mr-4">
      <img class="w-48 inline rounded-md shadow-md dark:border dark:border-gray-700" src="https://meanitsoftware.s3.us-east-1.amazonaws.com/rbac-bear.png" />
    </div>
    <p class="mt-2">Almost every application starts with roles at the organization level. But it's a very coarse model since it only allows you to grant access to all resources in an organization.</p>
    <p class="mt-2">A natural way to provide more fine-grained access is to extend the concept of roles to other resources in the application.</p>
    <p class="mt-2">We call this pattern resource-specific roles since we're granting users access to a specific resource by granting them a role directly on the resource.</p>
    <p class="mt-2">When you start thinking in terms of resource-specific roles, it might become clear that organization-level roles are a specific case of resource-specific roles where the resource is the organization!</p>
    <p class="mt-2">The code on the right demonstrates:</p>
    <ul class="list-disc list-inside mt-2">
      <li>How to add granularity at the repository level</li>
      <li>Repository as its own resource with read/delete permissions</li>
      <li>Role inheritance from organizations</li>
      <li>Testing that permissions work correctly across resources</li>
    </ul>
    <p class="mt-2">Take a look at the tests to understand how resource-specific roles enable fine-grained access control, and run them to validate that the policy works correctly!</p>
  </div>
      `,
      code: `
actor User { }

resource Organization {
  roles = ["admin", "member"];
  permissions = ["read", "add_member"];

  # admins inherit member permissions
  "member" if "admin";

  # org-level permissions
  "read" if "member";
  "add_member" if "admin";
}

resource Repository {
  roles = ["admin", "member"];
  permissions = ["read", "delete"];

  # role hierarchy
  "member" if "admin";

  # permission grants
  "read" if "member";
  "delete" if "admin";
}

# users inherit repository roles from org roles
has_role(user: User, role: String, repository: Repository) if
  org matches Organization and
  has_relation(repository, "organization", org) and
  has_role(user, role, org);
      `,
      authorizeQuery: 'User:alice read Repository:anvil',
      contextFacts: [
        ['has_role', { type: 'User', id: 'alice' }, 'member', { type: 'Organization', id: 'acme' }],
        ['has_relation', { type: 'Repository', id: 'anvil' }, 'organization', { type: 'Organization', id: 'acme' }],
        ['has_relation', { type: 'Repository', id: 'bar' }, 'organization', { type: 'Organization', id: 'foo' }]
      ]
  },


  {
    title: 'Global Roles',
    description: 'Learn how to implement global roles that span your entire application',
    chapter: 'Role-Based Access Control (RBAC)',
    text: `
<h1 class="text-xl mt-4 mb-2">Role-Based Access Control: Global Roles</h1>
<div class="flex flex-col gap-2">
  <p>Global roles are a powerful way to grant permissions that span your entire application, regardless of specific resources.</p>
  <p>This pattern is particularly useful for:</p>
  <ul class="list-disc list-inside">
    <li>Internal users who need broad access across the system</li>
    <li>Purely internal applications where granular resource control isn't needed</li>
    <li>Super-admin type roles that need universal access</li>
  </ul>
  <p>The code on the right demonstrates:</p>
  <ul class="list-disc list-inside">
    <li>How to declare global roles</li>
    <li>Inheritance between global and resource-specific roles</li>
    <li>Testing global role permissions</li>
  </ul>
  <p>Try running the test to validate that the policy works correctly, and take a look at the test to understand how global roles enable system-wide access control!</p>
</div>
    `,
    code: `
actor User { }

# Declare a global role
global {
  roles = ["superadmin"];
}

resource Organization {
  roles = ["admin", "member"];
  permissions = ["read", "write"];

  # superadmins have admin role on every organization
  "admin" if global "superadmin";

  # admins inherit member permissions
  "member" if "admin";

  # permissions per role
  "read" if "member";
  "write" if "admin";
}
    `,
    authorizeQuery: 'User:alice read Organization:acme',
    contextFacts: [
      ['has_role', { type: 'User', id: 'alice' }, 'superadmin'],
      ['has_role', { type: 'User', id: 'bob' }, 'member', { type: 'Organization', id: 'acme' }]
    ]
  },


  {
    title: 'Inheriting Roles',
    description: 'Learn how to inherit roles between related resources',
    chapter: 'Role-Based Access Control (RBAC)',
    text: `
<h1 class="text-xl mt-4 mb-2">Role-Based Access Control: Inheriting Roles</h1>
<div class="flex flex-col gap-2">
  <p>One common pattern in role-based access control is inheriting roles between related resources, particularly in parent-child relationships.</p>
  <p>For example, files and folders have a natural hierarchy where access to a folder typically grants access to its contents.</p>
  <p>The code on the right demonstrates:</p>
  <ul class="list-disc list-inside">
    <li>Using relations to model resource hierarchies</li>
    <li>Inheriting roles from parent to child resources</li>
    <li>Two-way role inheritance between resources</li>
    <li>Testing inheritance behavior</li>
  </ul>
  <p>Take a look at the test to understand how role inheritance works across resources, and run it to validate that the policy works correctly!</p>
</div>
    `,
    code: `
actor User {}

resource Repository {
  roles = ["reader", "maintainer"];
}

resource Folder {
  roles = ["reader", "writer"];
  relations = {
    repository: Repository,
    folder: Folder,
  };

  "reader" if "reader" on "repository";
  "writer" if "maintainer" on "repository";
  role if role on "folder";
}

resource File {
  permissions = ["read", "write"];
  roles = ["reader", "writer"];
  relations = {
    folder: Folder,
  };

  role if role on "folder";

  "read" if "reader";
  "write" if "writer";
}
    `,
    authorizeQuery: 'User:alice read File:test.py',
    contextFacts: [
      ['has_role', { type: 'User', id: 'alice' }, 'reader', { type: 'Repository', id: 'anvil' }],
      ['has_relation', { type: 'Folder', id: 'python' }, 'repository', { type: 'Repository', id: 'anvil' }],
      ['has_relation', { type: 'Folder', id: 'tests' }, 'folder', { type: 'Folder', id: 'python' }],
      ['has_relation', { type: 'File', id: 'test.py' }, 'folder', { type: 'Folder', id: 'tests' }]
    ]
  },


  {
    title: 'Resource Ownership',
    description: 'Learn how to grant additional permissions to resource owners',
    chapter: 'Role-Based Access Control (RBAC)',
    text: `
<h1 class="text-xl mt-4 mb-2">Role-Based Access Control: Resource Ownership</h1>
<div class="flex flex-col gap-2">
  <p>A common pattern in authorization is granting special permissions to the "owner" of a resource - for example, the creator of an issue or the author of a comment.</p>
  <p>In the code on the right:</p>
  <ul class="list-disc list-inside">
    <li>Issues have a creator relation that points to the User who created them</li>
    <li>Issue creators can update and close their own issues</li>
    <li>Repository maintainers can close but not update issues</li>
    <li>Both creators and admins can read and comment on issues</li>
  </ul>
  <p>Take a look at the tests to understand how issue ownership and permissions work, and run them to validate that the policy works correctly!</p>
</div>
      `,
      code: `
actor User { }

resource Repository {
  roles = ["maintainer"];
}

resource Issue {
  roles = ["reader", "admin"];
  permissions = ["read", "comment", "update", "close"];
  relations = { repository: Repository, creator: User };

  # repository maintainers can administer issues
  "admin" if "maintainer" on "repository";

  "reader" if "admin";
  "reader" if "creator";

  "read" if "reader";
  "comment" if "reader";

  "update" if "creator";
  "close" if "creator";
  "close" if "admin";
}`,
    authorizeQuery: 'User:alice close Issue:537',
    contextFacts: [
      ['has_relation', { type: 'Issue', id: '537' }, 'repository', { type: 'Repository', id: 'anvil' }],
      ['has_relation', { type: 'Issue', id: '537' }, 'creator', { type: 'User', id: 'alice' }],
      ['has_role', { type: 'User', id: 'bob' }, 'maintainer', { type: 'Repository', id: 'anvil' }]
    ]
  },


  {
    title: 'Resource Sharing',
    description: 'Learn how to share resources and control access at a granular level',
    chapter: 'Role-Based Access Control (RBAC)',
    text: `
<h1 class="text-xl mt-4 mb-2">Role-Based Access Control: Resource Sharing</h1>
<div class="flex flex-col gap-2">
  <p>A common need in authorization systems is to be able to grant access to specific resources to specific people. This is often called resource sharing.</p>
  <p>For example, you might want to:</p>
  <ul class="list-disc list-inside">
    <li>Share a document with a colleague</li>
    <li>Invite someone to a private repository</li>
    <li>Grant access to a specific file</li>
  </ul>
  <p>
    Your application would use Oso to check whether a user has the "invite" permission, and, if, so, allow that user to send an invitation.
    When an invitation is accepted, the recipient is typically granted the "reader" role on that repository.
  </p>
  <p>The code on the right demonstrates:</p>
  <ul class="list-disc list-inside">
    <li>How to define roles that control resource access</li>
    <li>Using permissions to control who can share resources</li>
    <li>Testing that sharing permissions work correctly</li>
  </ul>
  <p>Take a look at the test to understand how resource sharing works, and run it to validate that the policy works correctly!</p>
</div>
    `,
    code: `
actor User { }

resource Repository {
  roles = ["reader", "admin"];
  permissions = ["read", "invite"];

  "read" if "reader";
  "invite" if "admin";
}
    `,
    authorizeQuery: 'User:alice invite Repository:anvil',
    contextFacts: [
      ['has_role', { type: 'User', id: 'alice' }, 'admin', { type: 'Repository', id: 'anvil' }],
      ['has_role', { type: 'User', id: 'bob' }, 'reader', { type: 'Repository', id: 'anvil' }]
    ]
  },


  {
    title: 'Multitenant Roles',
    description: 'Learn how to use roles to simplify your authorization logic',
    chapter: 'Role-Based Access Control (RBAC)',
    text: `
<h1 class="text-xl mt-4 mb-2">Role-Based Access Control: Multitenant Roles</h1>
<div class="flex flex-col gap-2">
  <p>Almost every application will have some form of role-based access control (RBAC). RBAC is so ubiquitous that Oso Cloud provides concise syntax for modeling it.</p>
  <p>The simplest RBAC model to begin with is organization-level roles, in which users are assigned roles on the organization that they belong to.</p>
  <p>The basic logic of RBAC is: "a user has a permission if they are granted a role and the role grants that permission".</p>
  <p>The code on the right demonstrates organization-level roles where:</p>
  <ul class="list-disc list-inside">
    <li>Users are assigned roles on organizations they belong to</li>
    <li>Admin role inherits all member permissions</li>
    <li>Different permissions are granted to different roles</li>
    <li>Tests verify role-based access controls work correctly</li>
  </ul>
  <p>Take a look at the test to understand how organization-level roles work - it shows that members can read organizations and repositories but cannot delete repositories or access other organizations. Run the test to validate that the policy works correctly!</p>
</div>
    `,
    code: `
actor User { }

resource Organization {
  roles = ["admin", "member"];
  permissions = [
    "read", "add_member", "repository.create",
    "repository.read", "repository.delete"
  ];

  # role hierarchy:
  # admins inherit all member permissions
  "member" if "admin";

  # org-level permissions
  "read" if "member";
  "add_member" if "admin";
  # permission to create a repository
  # in the organization
  "repository.create" if "admin";

  # permissions on child resources
  "repository.read" if "member";
  "repository.delete" if "admin";
}`,
    authorizeQuery: 'User:alice read Organization:acme',
    contextFacts: [
      ['has_role', { type: 'User', id: 'alice' }, 'member', { type: 'Organization', id: 'acme' }]
    ]
  },


  {
    title: 'Custom Roles',
    description: 'Learn how to implement flexible custom roles for different organization needs',
    chapter: 'Role-Based Access Control (RBAC)',
    text: `
<h1 class="text-xl mt-4 mb-2">Role-Based Access Control: Custom Roles</h1>
<div class="flex flex-col gap-2">
  <p>Some applications need more flexibility than predefined roles can provide. Different organizations may want their users to engage with features in diverse ways that can't be anticipated.</p>
  <p>Custom roles allow organizations to create roles on the fly with exactly the permissions they need.</p>
  <p>The code on the right demonstrates:</p>
  <ul class="list-disc list-inside">
    <li>Defining custom Role types</li>
    <li>Granting configurable permissions at the organization level</li>
    <li>Inheriting permissions on repositories</li>
    <li>Careful exposure of permissions to users</li>
  </ul>
  <p>Take a look at the test to understand how custom roles provide flexible access control, and run it to validate that the policy works correctly!</p>
</div>
    `,
    code: `
actor User { }
actor Role { }

resource Organization {
  roles = ["admin", "member"];
  permissions = [
    "read", "add_member", "repository.create",
    "repository.read", "repository.delete"
  ];

  # role hierarchy:
  # admins inherit all permissions that members have
  "member" if "admin";

  # org-level permissions
  "read" if "member";
  "add_member" if "admin";
  # permission to create a repository in the organization
  "repository.create" if "admin";
}

# A custom role is defined by the permissions it grants
has_permission(actor: Actor, action: String, org: Organization) if
  role matches Role and
  has_role(actor, role, org) and
  grants_permission(role, action);


resource Repository {
  permissions = ["read", "delete"];
  roles = ["member", "admin"];
  relations = {
    organization: Organization,
  };

  # inherit all roles from the organization
  role if role on "organization";

  # admins inherit all member permissions
  "member" if "admin";

  "read" if "member";
  "delete" if "admin";

  "read" if "repository.read" on "organization";
  "delete" if "repository.delete" on "organization";
}`,
    authorizeQuery: 'User:alice repository.create Organization:acme',
    contextFacts: [
      ['grants_permission', { type: 'Role', id: 'repo-admin' }, 'repository.read'],
      ['grants_permission', { type: 'Role', id: 'repo-admin' }, 'repository.create'],
      ['grants_permission', { type: 'Role', id: 'repo-admin' }, 'repository.delete'],
      ['has_role', { type: 'User', id: 'alice' }, { type: 'Role', id: 'repo-admin' }, { type: 'Organization', id: 'acme' }],
      ['has_relation', { type: 'Repository', id: 'anvil' }, 'organization', { type: 'Organization', id: 'acme' }]
    ]
  },


  {
    title: 'User Groups',
    description: 'Learn how to organize permissions based on relationships between resources',
    chapter: 'Relationship-Based Access Control (ReBAC)',
    text: `
<h1 class="text-xl mt-4 mb-2">Relationship-Based Access Control: User Groups</h1>
<div>
  <div class="float-left mr-4">
    <img class="w-48 inline rounded-md shadow-md dark:border dark:border-gray-700" src="https://meanitsoftware.s3.us-east-1.amazonaws.com/rebac-bear.png" />
  </div>
  <p class="mt-2">Relationship-based access control (ReBAC) means organizing permissions based on relationships between resources. Let's look at a basic example involving groups and repositories.</p>
  <p class="mt-2">So far, your policies have only had one type of actor: a user. This policy has two actors: users and groups.</p>
  <p class="mt-2">There is a <code>has_group()</code> fact that determines whether a user belongs to a group. You can think of <code>has_group()</code> as a relationship between a user and a group.</p>
  <p class="mt-2">In the code on the right:</p>
  <ul class="list-disc list-inside mt-2">
    <li>Users can inherit roles from groups they belong to</li>
    <li>The Repository resource defines a reader role</li>
    <li>In the test block, the group <code>anvil-readers</code> has the reader role on the <code>anvil</code> repository</li>
  </ul>
  <p class="mt-2">Take a look at the test to understand how relationship inheritance works, and run it to validate that the policy works correctly!</p>
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
    `,
    authorizeQuery: 'User:alice read Repository:anvil',
    contextFacts: [
      ['has_role', { type: 'Group', id: 'anvil-readers' }, 'reader', { type: 'Repository', id: 'anvil' }],
      ['has_group', { type: 'User', id: 'alice' }, { type: 'Group', id: 'anvil-readers' }],
      ['has_group', { type: 'User', id: 'bob' }, { type: 'Group', id: 'anvil-readers' }],
      ['has_group', { type: 'User', id: 'charlie' }, { type: 'Group', id: 'anvil-readers' }]
    ]
  },


  {
    title: 'User-Resource Relationships',
    description: 'Learn how relationships between users and resources affect permissions',
    chapter: 'Relationship-Based Access Control (ReBAC)',
    text: `
  <h1 class="text-xl mt-4 mb-2">Relationship-Based Access Control: User-Resource Relationships</h1>
  <div class="flex flex-col gap-2">
    <p>Many applications want to grant special permissions based on a relationship between a user and a resource, such as allowing a repository's creator to delete it.</p>
    <p>These relationships should be used when representing core concepts of your application, while roles are better for granting explicit access permissions.</p>
    <p>The code on the right demonstrates:</p>
    <ul class="list-disc list-inside">
      <li>Defining creator relationships on issues</li>
      <li>Granting special permissions to issue creators</li>
      <li>Combining relationships with role-based permissions</li>
      <li>Testing different permission combinations</li>
    </ul>
    <p>Take a look at the test to understand how user-resource relationships work, and run it to validate that the policy works correctly!</p>
  </div>
    `,
    code: `
actor User { }

resource Repository {
  roles = ["maintainer"];
}

resource Issue {
  roles = ["reader", "admin"];
  permissions = ["read", "comment", "update", "close"];
  relations = { repository: Repository, creator: User };

  # repository maintainers can administer issues
  "admin" if "maintainer" on "repository";

  "reader" if "admin";
  "reader" if "creator";

  "read" if "reader";
  "comment" if "reader";

  "update" if "creator";
  "close" if "creator";
  "close" if "admin";
}
    `,
    authorizeQuery: 'User:alice close Issue:537',
    contextFacts: [
      ['has_relation', { type: 'Issue', id: '537' }, 'repository', { type: 'Repository', id: 'anvil' }],
      ['has_relation', { type: 'Issue', id: '537' }, 'creator', { type: 'User', id: 'alice' }],
      ['has_role', { type: 'User', id: 'bob' }, 'maintainer', { type: 'Repository', id: 'anvil' }]
    ]
  },


  {
    title: 'Files & Folders',
    description: 'Learn how to implement hierarchical file/folder permissions',
    chapter: 'Relationship-Based Access Control (ReBAC)',
    text: `
<h1 class="text-xl mt-4 mb-2">Relationship-Based Access Control: Files & Folders</h1>
<div class="flex flex-col gap-2">
  <p>One common pattern in authorization is managing permissions for hierarchical file/folder structures, where access cascades down from parent to child resources.</p>
  <p>The code on the right demonstrates:</p>
  <ul class="list-disc list-inside">
    <li>Defining relationships between repositories, folders, and files</li>
    <li>Cascading permissions down folder hierarchies</li>
    <li>Recursive role inheritance from parent to child folders</li>
    <li>Testing permissions across nested resources</li>
  </ul>
  <p>Take a look at the test to understand how file/folder hierarchies work, and run it to validate that the policy works correctly!</p>
</div>
      `,
      code: `
actor User { }

resource Repository {
  roles = ["reader", "maintainer"];
}

resource Folder {
  roles = ["reader", "writer"];
  relations = {
    repository: Repository,
    folder: Folder,
  };

  "reader" if "reader" on "repository";
  "writer" if "maintainer" on "repository";
  role if role on "folder";
}

resource File {
  permissions = ["read", "write"];
  roles = ["reader", "writer"];
  relations = {
    folder: Folder,
  };

  role if role on "folder";

  "read" if "reader";
  "write" if "writer";
}
    `,
    authorizeQuery: 'User:alice read File:test.py',
    contextFacts: [
      ['has_role', { type: 'User', id: 'alice' }, 'reader', { type: 'Repository', id: 'anvil' }],
      ['has_relation', { type: 'Folder', id: 'python' }, 'repository', { type: 'Repository', id: 'anvil' }],
      ['has_relation', { type: 'Folder', id: 'tests' }, 'folder', { type: 'Folder', id: 'python' }],
      ['has_relation', { type: 'File', id: 'test.py' }, 'folder', { type: 'Folder', id: 'tests' }]
    ]
  },


  {
    title: 'Impersonation',
    description: 'Learn how to implement user impersonation for support and admin scenarios',
    chapter: 'Relationship-Based Access Control (ReBAC)',
    text: `
  <h1 class="text-xl mt-4 mb-2">Relationship-Based Access Control: Impersonation</h1>
  <div class="flex flex-col gap-2">
    <p>Impersonation is a pattern where certain users can temporarily inherit permissions from other users. This is useful for customer support, troubleshooting, and admin oversight.</p>
    <p>For example:</p>
    <ul class="list-disc list-inside">
      <li>Support reps need to see what users see</li>
      <li>HR admins need to act on behalf of employees</li>
      <li>System admins need to debug user issues</li>
    </ul>
    <p>The code on the right demonstrates:</p>
    <ul class="list-disc list-inside">
      <li>Defining impersonation permissions</li>
      <li>Policies for granting temporary access</li>
      <li>Restricting access to sensitive operations</li>
      <li>Testing impersonation flows</li>
    </ul>
    <p>Take a look at the test to understand how impersonation works, and run it to validate that the policy works correctly!</p>
  </div>
      `,
      code: `
actor User {
  permissions = ["impersonate"];

  "impersonate" if global "support";
}

global {
  roles = ["support"];
}

resource Organization {
  roles = ["admin", "member"];
  permissions = ["read", "write"];

  "member" if "admin";

  "read" if "member";
  "write" if "admin";
}

# A user can do anything another user can do if they
# 1. Have permission to impersonate that user
# 2. Are currently impersonating them
allow(user: User, action: String, resource: Resource) if
  other_user matches User and
  has_permission(user, "impersonate", other_user) and
  is_impersonating(user, other_user) and
  has_permission(other_user, action, resource);

# Default allow rule since we added our own custom one
allow(user: User, action: String, resource: Resource) if
  has_permission(user, action, resource);
`,
    authorizeQuery: 'User:alice read Organization:acme',
    contextFacts: [
      ['has_role', { type: 'User', id: 'alice' }, 'support'],
      ['has_role', { type: 'User', id: 'bob' }, 'admin', { type: 'Organization', id: 'acme' }],
      ['is_impersonating', { type: 'User', id: 'alice' }, { type: 'User', id: 'bob' }]
    ]
  },


  {
    title: 'Organization Hierarchies',
    description: 'Learn how to implement authorization based on organizational reporting structures',
    chapter: 'Relationship-Based Access Control (ReBAC)',
    text: `
  <h1 class="text-xl mt-4 mb-2">Relationship-Based Access Control: Organization Hierarchies</h1>
  <div class="flex flex-col gap-2">
    <p>Many companies need their authorization policy to correspond to their org chart, especially in HR systems, recruiting platforms, and CRM tools.</p>
    <p>A common model is having managers or supervisors access data of their direct reports. The code on the right demonstrates:</p>
    <ul class="list-disc list-inside">
      <li>Defining hierarchical manager relationships between users</li>
      <li>Granting repository access up the management chain</li>
      <li>Recursive role inheritance for multi-level hierarchies</li>
      <li>Testing manager access to employee repositories</li>
    </ul>
    <p>Take a look at the test to understand how organization hierarchies work, and run it to validate that the policy works correctly!</p>
  </div>
    `,
    code: `
actor User {
  relations = { direct_manager: User };
  roles = ["manager"];

  "manager" if "direct_manager";
  # This forms the recursive hierarchy; we could remove this line and simplify
  # the policy a bit if we only wanted a single-level of hierarchical
  # visibility.
  "manager" if "manager" on "direct_manager";
}

resource Repository {
  roles = ["viewer"];
  permissions = ["read"];
  relations = { creator: User };

  "viewer" if "creator";
  "viewer" if "manager" on "creator";
  "read" if "viewer";
}
    `,
    authorizeQuery: 'User:bhav read Repository:acme',
    contextFacts: [
      ['has_relation', { type: 'Repository', id: 'acme' }, 'creator', { type: 'User', id: 'alice' }],
      ['has_relation', { type: 'User', id: 'alice' }, 'direct_manager', { type: 'User', id: 'bhav' }],
      ['has_relation', { type: 'User', id: 'bhav' }, 'direct_manager', { type: 'User', id: 'crystal' }],
      ['has_relation', { type: 'User', id: 'fergie' }, 'direct_manager', { type: 'User', id: 'crystal' }]
    ]
  },


  {
    title: 'Public/Private Resources',
    description: 'Learn how attributes and characteristics of resources control access to them',
    chapter: 'Attribute-Based Access Control (ABAC)',
    text: `
<h1 class="text-xl mt-4 mb-2">Attribute-Based Access Control: Public/Private Resources</h1>
<div>
  <div class="float-left mr-4">
    <img class="w-48 inline rounded-md shadow-md dark:border dark:border-gray-700" src="https://meanitsoftware.s3.us-east-1.amazonaws.com/abac-bear.png" />
  </div>
  <p class="mt-2">
    Attribute-based access control (ABAC) encompasses any scenario where attributes of a resource (like public/private status, sensitivity level), user (like department, clearance level), or environment (like time of day, IP address) determine access.
    Let's look at one common pattern - public/private resources.
  </p>
  <p class="mt-2">
    <code>is_public()</code> is a fact that controls whether a given resource is public or private. This is an example of an arbitrary attribute associated with a respository. Your policy can then make authorization decisions based on whether a repository is public or private.
  </p>
  <p class="mt-2">In the code on the right:</p>
  <ul class="list-disc list-inside mt-2">
    <li>The Repository resource has a read permission</li>
    <li>We define a rule that allows anyone to read public repositories</li>
    <li>The test verifies that any user can read a public repository</li>
  </ul>
  <p class="mt-2">Take a look at the test to understand how public repositories work, and run it to validate that the policy works correctly!</p>
</div>
    `,
    code: `
actor User { }
resource Repository {
  permissions = ["read"];

  "read" if is_public(resource);
}
    `,
    authorizeQuery: 'User:alice read Repository:anvil',
    contextFacts: [
      ['is_public', { type: 'Repository', id: 'anvil' }]
    ]
  },


  {
    title: 'Conditional Roles',
    description: 'Learn how to implement conditional roles based on organization preferences',
    chapter: 'Attribute-Based Access Control (ABAC)',
    text: `
  <h1 class="text-xl mt-4 mb-2">Attribute-Based Access Control: Conditional Roles</h1>
  <div class="flex flex-col gap-2">
    <p>In multi-tenant systems, different organizations often need different default roles and permissions. Conditional roles enable configurable defaults without duplicating data.</p>
    <p>The code on the right demonstrates:</p>
    <ul class="list-disc list-inside">
      <li>Setting organization-wide default roles</li>
      <li>Inheriting roles based on organization settings</li>
      <li>Controlling who can configure default roles</li>
      <li>Testing default role inheritance</li>
    </ul>
    <p>Take a look at the test to understand how conditional roles enable flexible defaults, and run it to validate that the policy works correctly!</p>
  </div>
    `,
    code: `
actor User {}

resource Organization {
  roles = ["member", "admin"];
  permissions = ["set_default_role"];

  "set_default_role" if "admin";
}

resource Repository {
  roles = ["reader", "editor", "admin"];
  permissions = ["write"];
  relations = { organization: Organization };

  "write" if "editor";
}

has_role(actor: Actor, role: String, repo: Repository) if
  org matches Organization and
  has_relation(repo, "organization", org) and
  has_default_role(org, role) and
  has_role(actor, "member", org);
    `,
    authorizeQuery: 'User:alice write Repository:anvil',
    contextFacts: [
      ['has_default_role', { type: 'Organization', id: 'acme' }, 'editor'],
      ['has_role', { type: 'User', id: 'alice' }, 'member', { type: 'Organization', id: 'acme' }],
      ['has_relation', { type: 'Repository', id: 'anvil' }, 'organization', { type: 'Organization', id: 'acme' }]
    ]
  },


  {
    title: 'Role Toggles',
    description: 'Learn how to implement toggles and switches to control access',
    chapter: 'Attribute-Based Access Control (ABAC)',
    text: `
  <h1 class="text-xl mt-4 mb-2">Attribute-Based Access Control: Role Toggles</h1>
  <div class="flex flex-col gap-2">
    <p>Sometimes we want to conditionally inherit roles based on resource attributes rather than relationships.</p>
    <p>A common pattern is having a toggle on the resource itself that restricts access, like a "protected" flag.</p>
    <p>The code on the right demonstrates:</p>
    <ul class="list-disc list-inside">
      <li>Repositories inherit roles from organizations unless the repository is protected</li>
      <li>Explicit roles on the repository override protected repositories</li>
    </ul>
    <p>Take a look at the test to understand how repository toggles work, and run it to validate that the policy works correctly!</p>
  </div>
      `,
      code: `
actor User { }

resource Organization {
  roles = ["member"];
  permissions = ["read"];

  "read" if "member";
}

resource Repository {
  permissions = ["read"];
  roles = ["member"];
  relations = {
    organization: Organization,
  };

  # Explicit roles on the repository override protected repositories
  "read" if "member";
}

has_role(actor: Actor, role: String, repository: Repository) if
  # Repositories inherit roles from organizations unless the repository is protected
  not is_protected(repository) and
  org matches Organization and
  has_relation(repository, "organization", org) and
  has_role(actor, role, org);
      `,
    authorizeQuery: 'User:alice read Repository:website',
    contextFacts: [
      ['has_role', { type: 'User', id: 'alice' }, 'member', { type: 'Organization', id: 'acme' }],
      ['has_relation', { type: 'Repository', id: 'anvil' }, 'organization', { type: 'Organization', id: 'acme' }],
      ['has_relation', { type: 'Repository', id: 'website' }, 'organization', { type: 'Organization', id: 'acme' }],
      ['is_protected', { type: 'Repository', id: 'anvil' }]
    ]
  },


  {
    title: 'Time-Based Checks',
    description: 'Learn how to implement access controls that expire after a period of time',
    chapter: 'Attribute-Based Access Control (ABAC)',
    text: `
<h1 class="text-xl mt-4 mb-2">Attribute-Based Access Control: Time-Based Checks</h1>
<div class="flex flex-col gap-2">
  <p>Time-based permissions are useful for granting temporary access to resources, like giving a contractor access for their contract duration.</p>
  <p>You can add an expiration time to role assignments to automatically revoke access when the time expires.</p>
  <p>The code on the right demonstrates:</p>
  <ul class="list-disc list-inside">
    <li>Defining roles with expiration times</li>
    <li>Comparing expiration times against current time</li>
    <li>Testing expired vs unexpired access</li>
  </ul>
  <p>Take a look at the test to understand how time-based access works, and run it to validate that the policy works correctly!</p>
</div>
      `,
      code: `
actor User { }

resource Repository {
  roles = ["member"];
  permissions = ["read"];

  "read" if "member";
}

has_role(actor: Actor, role: String, repo: Repository) if
  expiration matches Integer and
  has_role_with_expiry(actor, role, repo, expiration) and
  expiration > @current_unix_time;
      `,
    authorizeQuery: 'User:alice read Repository:anvil',
    contextFacts: [
      ['has_role_with_expiry', { type: 'User', id: 'alice' }, 'member', { type: 'Repository', id: 'anvil' }, 2002913298],
      ['has_role_with_expiry', { type: 'User', id: 'bob' }, 'member', { type: 'Repository', id: 'anvil' }, 1655758135]
    ]
  },

  {
    title: 'Entitlements',
    description: 'Learn how to implement subscription-based access control with entitlements and quotas',
    chapter: 'Attribute-Based Access Control (ABAC)',
    text: `
  <h1 class="text-xl mt-4 mb-2">Attribute-Based Access Control: Entitlements</h1>
  <div class="flex flex-col gap-2">
    <p>Many applications need to restrict access based on subscription tiers and paid features. This is implemented through entitlements that grant permissions based on a user's role and their organization's subscription.</p>
    <p>The code on the right demonstrates:</p>
    <ul class="list-disc list-inside">
      <li>Defining subscription plans and features</li>
      <li>Tracking quota usage per organization</li>
      <li>Granting permissions based on available quota</li>
      <li>Testing access across different subscription tiers</li>
    </ul>
    <p>Take a look at the test to understand how subscription-based access works, and run it to validate that the policy works correctly!</p>
  </div>
      `,
      code: `
actor User { }

resource Organization {
  roles = ["admin", "member"];
  permissions = ["repository.create"];

  "member" if "admin";
}

resource Plan {
  roles = ["subscriber"];
  relations = { subscribed_organization: Organization };

  "subscriber" if role on "subscribed_organization";
}

resource Feature {
  relations = { plan: Plan };
}

has_permission(user: User, "repository.create", org: Organization) if
  has_role(user, "member", org) and
  has_quota_remaining(org, Feature{"repository"});

has_quota_remaining(org: Organization, feature: Feature) if
  quota matches Integer and
  has_quota(org, feature, quota) and
  used matches Integer and
  quota_used(org, feature, used) and
  used < quota;

has_quota(org: Organization, feature: Feature, quota: Integer) if
  plan matches Plan and
  has_relation(plan, "subscribed", org) and
  plan_quota(plan, feature, quota);

plan_quota(Plan{"pro"}, Feature{"repository"}, 10);
plan_quota(Plan{"basic"}, Feature{"repository"}, 0);
`,
    authorizeQuery: 'User:alice repository.create Organization:apple',
    contextFacts: [
      ['quota_used', { type: 'Organization', id: 'apple' }, { type: 'Feature', id: 'repository' }, 5],
      ['has_relation', { type: 'Plan', id: 'pro' }, 'subscribed', { type: 'Organization', id: 'apple' }],
      ['has_role', { type: 'User', id: 'alice' }, 'member', { type: 'Organization', id: 'apple' }]
    ]
  },


  {
    title: 'Wrapping Up',
    description: 'Learn where to go next in your authorization journey',
    chapter: 'Wrapping Up',
    text: `
  <h1 class="text-xl mt-4 mb-2">Wrapping Up</h1>
  <div>
    <div class="float-left mr-4">
      <img class="w-48 inline rounded-md shadow-md dark:border dark:border-gray-700 dark:bg-white" src="https://meanitsoftware.s3.us-east-1.amazonaws.com/wrapping-up-bear.png" />
    </div>
    <p class="mt-2">Congratulations on completing the Polar authorization language tour! You've learned about:</p>
    <ul class="list-disc list-inside mt-2">
      <li>Basic rules and permissions</li>
      <li>Role-based access control (RBAC) patterns</li>
      <li>Relationship-based access control (ReBAC)</li>
      <li>Attribute-based access control (ABAC)</li>
    </ul>
    <p class="mt-2">To continue your authorization journey:</p>
    <ul class="list-disc list-inside mt-2">
      <li>Visit the <a class="text-indigo-500" href="https://www.osohq.com/docs">Oso documentation</a> to dive deeper into authorization concepts</li>
      <li>Check out the <a class="text-indigo-500" href="https://www.osohq.com/docs/guides">guides and tutorials</a> for practical examples</li>
      <li>Join the <a class="text-indigo-500" href="https://join-slack.osohq.com/">Oso Slack community</a> to connect with other developers</li>
      <li>Browse example <a class="text-indigo-500" href="https://github.com/osohq">projects on GitHub</a> to see authorization in action</li>
    </ul>
    <p class="mt-2">Remember that building robust authorization is an iterative process. Start simple and add complexity as your needs evolve.</p>
    <p class="mt-2">Thank you for taking the tour!</p>
  </div>
    `,
    code: `
actor User {}

# A simple example to recap core concepts
resource Repository {
  permissions = ["read", "write"];
  roles = ["reader", "contributor"];
  relations = { owner: User };

  "read" if "reader";
  "write" if "contributor";

  # role hierarchy
  "reader" if "contributor";

  # ownership grants all permissions
  "contributor" if "owner";
}
    `,
    authorizeQuery: 'User:alice read Repository:example',
    contextFacts: [
      ['has_relation', { type: 'Repository', id: 'example' }, 'owner', { type: 'User', id: 'alice' }],
      ['has_role', { type: 'User', id: 'bob' }, 'reader', { type: 'Repository', id: 'example' }]
    ]
  }
].reduce((res, section) => {
  let chapterSections = section.chapter;
  if (!res[chapterSections]) {
    res[chapterSections] = [];
  }
  res[chapterSections].push(section);
  return res;
}, {});

const chapterSlugs = {
  'Basics': 'basics',
  'Role-Based Access Control (RBAC)': 'rbac',
  'Relationship-Based Access Control (ReBAC)': 'rebac',
  'Attribute-Based Access Control (ABAC)': 'abac',
  'Wrapping Up': 'wrapping-up'
};

const chapterImages = {
  'Basics': 'https://meanitsoftware.s3.us-east-1.amazonaws.com/bear1.png',
  'Role-Based Access Control (RBAC)': 'https://meanitsoftware.s3.us-east-1.amazonaws.com/rbac-bear.png',
  'Relationship-Based Access Control (ReBAC)': 'https://meanitsoftware.s3.us-east-1.amazonaws.com/rebac-bear.png',
  'Attribute-Based Access Control (ABAC)': 'https://meanitsoftware.s3.us-east-1.amazonaws.com/abac-bear.png',
  'Wrapping Up': 'https://meanitsoftware.s3.us-east-1.amazonaws.com/wrapping-up-bear.png'
};

const slugToChapter = Object.fromEntries(
  Object.entries(chapterSlugs).map(([chapter, slug]) => [slug, chapter])
);
