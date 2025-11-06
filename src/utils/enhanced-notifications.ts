import { toast } from 'sonner@2.0.3'

// Enhanced notification service with better UX
export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    })
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    })
  },

  loading: (message: string) => {
    return toast.loading(message)
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  },

  // Specialized notifications for common actions
  projectCreated: (projectName: string) => {
    toast.success('Project Created! 🎉', {
      description: `${projectName} has been added to your workspace`,
      duration: 3000,
    })
  },

  taskCompleted: (taskName: string) => {
    toast.success('Task Completed! ✅', {
      description: `Great job completing "${taskName}"`,
      duration: 3000,
    })
  },

  dataExported: () => {
    toast.success('Data Exported Successfully! 📦', {
      description: 'Your backup file has been downloaded',
      duration: 3000,
    })
  },

  dataImported: () => {
    toast.success('Data Imported! 🎊', {
      description: 'Your data has been restored successfully',
      duration: 3000,
    })
  },

  welcomeBack: (userName?: string) => {
    toast.success(`Welcome back${userName ? `, ${userName}` : ''}! 👋`, {
      description: 'Your workspace is ready',
      duration: 2000,
    })
  },

  storageWarning: (percentage: number) => {
    toast.warning('Storage Running Low ⚠️', {
      description: `You're using ${percentage.toFixed(0)}% of your available storage. Consider exporting and archiving old projects.`,
      duration: 6000,
    })
  },

  offlineMode: () => {
    toast.info('Offline Mode Active 📴', {
      description: 'All changes are saved locally and will sync when you\'re back online',
      duration: 4000,
    })
  },

  featureComingSoon: (featureName: string) => {
    toast.info(`${featureName} Coming Soon! 🚀`, {
      description: 'This feature is under development and will be available in a future update',
      duration: 3000,
    })
  },
}

// Performance tracking
export const trackAction = (actionName: string, metadata?: Record<string, any>) => {
  const timestamp = new Date().toISOString()
  console.log(`[Action] ${actionName}`, {
    timestamp,
    ...metadata
  })
}

// Analytics helper
export const logEvent = (eventName: string, properties?: Record<string, any>) => {
  // In a production app, this would send to analytics service
  console.log(`[Event] ${eventName}`, properties)
}
