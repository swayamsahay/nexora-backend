import DevProject from "../models/DevProject.js";

/**
 * Dev Mode Service - Handle frontend/backend/database code views
 */

/**
 * Create or update dev project
 */
export const saveDevProject = async (userId, storeId, devData) => {
  try {
    console.log(`[Dev] Saving dev project for user ${userId}, store ${storeId}`);

    let project = await DevProject.findOne({ userId, storeId });

    if (project) {
      // Save current state as version before updating
      if (project.versions.length < 10) {
        project.versions.push({
          timestamp: new Date(),
          label: `Version ${project.currentVersion + 1}`,
          data: {
            frontendCode: project.frontendCode,
            backendRoutes: project.backendRoutes,
            databaseSchema: project.databaseSchema,
          },
        });
        project.currentVersion += 1;
      }

      // Update with new data
      project.frontendCode = devData.frontendCode || project.frontendCode;
      project.backendRoutes = devData.backendRoutes || project.backendRoutes;
      project.databaseSchema = devData.databaseSchema || project.databaseSchema;
      project.lastSynced = new Date();
      project.updatedAt = new Date();

      await project.save();
      console.log(`[Dev] Dev project updated: ${project._id}`);
      return project;
    }

    // Create new dev project
    project = new DevProject({
      userId,
      storeId,
      frontendCode: devData.frontendCode || {},
      backendRoutes: devData.backendRoutes || {},
      databaseSchema: devData.databaseSchema || {},
      lastSynced: new Date(),
    });

    await project.save();
    console.log(`[Dev] New dev project created: ${project._id}`);
    return project;
  } catch (error) {
    console.error(`[Dev] Error saving dev project:`, error);
    throw error;
  }
};

/**
 * Get dev project (frontend + backend + database views)
 */
export const getDevProject = async (userId, storeId) => {
  try {
    console.log(`[Dev] Fetching dev project for user ${userId}, store ${storeId}`);

    const project = await DevProject.findOne({ userId, storeId });

    if (!project) {
      throw new Error("Dev project not found");
    }

    return {
      frontend: project.frontendCode,
      backend: project.backendRoutes,
      database: project.databaseSchema,
      lastSynced: project.lastSynced,
      currentVersion: project.currentVersion,
    };
  } catch (error) {
    console.error(`[Dev] Error fetching dev project:`, error);
    throw error;
  }
};

/**
 * Update frontend code structure
 */
export const updateFrontendCode = async (userId, storeId, frontendData) => {
  try {
    console.log(`[Dev] Updating frontend code for store ${storeId}`);

    const project = await DevProject.findOne({ userId, storeId });

    if (!project) {
      throw new Error("Dev project not found");
    }

    // Save version
    if (project.versions.length < 10) {
      project.versions.push({
        timestamp: new Date(),
        label: `Version ${project.currentVersion + 1}`,
        data: {
          frontendCode: project.frontendCode,
          backendRoutes: project.backendRoutes,
          databaseSchema: project.databaseSchema,
        },
      });
      project.currentVersion += 1;
    }

    project.frontendCode = frontendData;
    project.lastSynced = new Date();
    project.updatedAt = new Date();

    await project.save();
    console.log(`[Dev] Frontend code updated`);
    return project;
  } catch (error) {
    console.error(`[Dev] Error updating frontend:`, error);
    throw error;
  }
};

/**
 * Update backend routes
 */
export const updateBackendRoutes = async (userId, storeId, backendData) => {
  try {
    console.log(`[Dev] Updating backend routes for store ${storeId}`);

    const project = await DevProject.findOne({ userId, storeId });

    if (!project) {
      throw new Error("Dev project not found");
    }

    // Save version
    if (project.versions.length < 10) {
      project.versions.push({
        timestamp: new Date(),
        label: `Version ${project.currentVersion + 1}`,
        data: {
          frontendCode: project.frontendCode,
          backendRoutes: project.backendRoutes,
          databaseSchema: project.databaseSchema,
        },
      });
      project.currentVersion += 1;
    }

    project.backendRoutes = backendData;
    project.lastSynced = new Date();
    project.updatedAt = new Date();

    await project.save();
    console.log(`[Dev] Backend routes updated`);
    return project;
  } catch (error) {
    console.error(`[Dev] Error updating backend:`, error);
    throw error;
  }
};

/**
 * Update database schema
 */
export const updateDatabaseSchema = async (userId, storeId, schemaData) => {
  try {
    console.log(`[Dev] Updating database schema for store ${storeId}`);

    const project = await DevProject.findOne({ userId, storeId });

    if (!project) {
      throw new Error("Dev project not found");
    }

    // Save version
    if (project.versions.length < 10) {
      project.versions.push({
        timestamp: new Date(),
        label: `Version ${project.currentVersion + 1}`,
        data: {
          frontendCode: project.frontendCode,
          backendRoutes: project.backendRoutes,
          databaseSchema: project.databaseSchema,
        },
      });
      project.currentVersion += 1;
    }

    project.databaseSchema = schemaData;
    project.lastSynced = new Date();
    project.updatedAt = new Date();

    await project.save();
    console.log(`[Dev] Database schema updated`);
    return project;
  } catch (error) {
    console.error(`[Dev] Error updating database:`, error);
    throw error;
  }
};

/**
 * Rollback to previous version
 */
export const rollbackDevVersion = async (userId, storeId, versionNumber) => {
  try {
    console.log(`[Dev] Rolling back to version ${versionNumber}`);

    const project = await DevProject.findOne({ userId, storeId });

    if (!project) {
      throw new Error("Dev project not found");
    }

    if (versionNumber < 0 || versionNumber >= project.versions.length) {
      throw new Error("Invalid version number");
    }

    const versionData = project.versions[versionNumber].data;

    project.frontendCode = versionData.frontendCode;
    project.backendRoutes = versionData.backendRoutes;
    project.databaseSchema = versionData.databaseSchema;
    project.currentVersion = versionNumber;
    project.lastSynced = new Date();
    project.updatedAt = new Date();

    await project.save();
    console.log(`[Dev] Rolled back to version ${versionNumber}`);
    return project;
  } catch (error) {
    console.error(`[Dev] Error rolling back:`, error);
    throw error;
  }
};

/**
 * Sync builder state to dev project (called when builder is updated)
 */
export const syncBuilderToDev = async (userId, storeId, builderProject) => {
  try {
    console.log(`[Dev] Syncing builder state to dev project for store ${storeId}`);

    // Generate dev project structure from builder state
    const frontendCode = generateFrontendFromBuilder(builderProject);
    const backendRoutes = generateBackendFromBuilder(builderProject);
    const databaseSchema = generateDatabaseFromBuilder(builderProject);

    const devData = {
      frontendCode,
      backendRoutes,
      databaseSchema,
    };

    const devProject = await saveDevProject(userId, storeId, devData);
    console.log(`[Dev] Sync complete`);
    return devProject;
  } catch (error) {
    console.error(`[Dev] Error syncing:`, error);
    throw error;
  }
};

/**
 * Generate frontend structure from builder state
 */
const generateFrontendFromBuilder = (builder) => {
  return {
    pages: builder.pages.map((page) => ({
      name: page.name,
      path: `/${page.slug || page.name.toLowerCase()}`,
      sections: page.sections || [],
      components: page.sections || [],
    })),
    components: builder.components.map((comp) => ({
      name: comp.name,
      type: comp.type,
      props: comp.props || {},
    })),
    globalStyles: builder.layout.styles || {},
  };
};

/**
 * Generate backend structure from builder state
 */
const generateBackendFromBuilder = (builder) => {
  const routes = [];

  // Auto-generate CRUD routes for each page
  builder.pages.forEach((page) => {
    const slug = page.slug || page.name.toLowerCase();

    routes.push({
      path: `/api/${slug}`,
      method: "GET",
      handler: `get${capitalize(slug)}`,
      description: `Get ${page.name}`,
    });

    routes.push({
      path: `/api/${slug}`,
      method: "POST",
      handler: `create${capitalize(slug)}`,
      description: `Create ${page.name}`,
      auth: "required",
    });
  });

  return {
    publicRoutes: routes.filter((r) => !r.auth),
    protectedRoutes: routes.filter((r) => r.auth),
    webhooks: [],
  };
};

/**
 * Generate database structure from builder state
 */
const generateDatabaseFromBuilder = (builder) => {
  return {
    collections: [
      {
        name: "users",
        type: "collection",
        fields: [
          { name: "_id", type: "ObjectId", required: true, indexed: true },
          { name: "email", type: "String", required: true, indexed: true },
          { name: "name", type: "String", required: false, indexed: false },
        ],
        indexes: ["_id", "email"],
      },
      {
        name: "store",
        type: "collection",
        fields: [
          { name: "_id", type: "ObjectId", required: true, indexed: true },
          { name: "userId", type: "ObjectId", required: true, indexed: true },
          { name: "name", type: "String", required: true, indexed: false },
        ],
        indexes: ["_id", "userId"],
      },
      ...(builder.pages || []).map((page) => ({
        name: page.slug || page.name.toLowerCase(),
        type: "collection",
        fields: [
          { name: "_id", type: "ObjectId", required: true, indexed: true },
          { name: "storeId", type: "ObjectId", required: true, indexed: true },
          { name: "createdAt", type: "Date", required: false, indexed: false },
        ],
        indexes: ["_id", "storeId"],
      })),
    ],
    relationships: [
      {
        from: "store",
        to: "users",
        type: "many-to-one",
      },
    ],
  };
};

/**
 * Helper: Capitalize string
 */
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
