const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [100, 'First name cannot exceed 100 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [100, 'Last name cannot exceed 100 characters']
  },
  gender: {
    type: String,
    enum: {
      values: ['Hombre', 'Mujer', 'N/A'],
      message: 'Gender must be either Hombre, Mujer, or N/A'
    }
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: {
      values: ['Español'],
      message: 'Language must be Español'
    }
  },
  birthday: {
    type: Date,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v) && v < new Date();
      },
      message: 'Birthday must be a valid date in the past'
    }
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  ageRange: {
    type: String,
    enum: {
      values: [
        'Menos de 18 años',
        '19-25 años',
        '26-34 años',
        '35-44 años',
        '45-54 años',
        '55-64 años',
        '65 años o más'
      ],
      message: 'Please select a valid age range'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  termsAccepted: {
    type: Boolean,
    required: [true, 'Terms and conditions acceptance is required'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'Terms and conditions must be accepted'
    }
  },
  skinType: {
    type: String,
    enum: {
      values: ['Seca', 'Normal', 'Grasa', 'Mixta', 'Sensible'],
      message: 'Please select a valid skin type'
    }
  },
  skinConcerns: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        const validConcerns = [
          'Piel sensible',
          'Envejecimiento',
          'Imperfecciones',
          'Brillo en la piel',
          'Maquillaje',
          'Proteger piel vs factores externos',
          'Piel seca rostro',
          'Piel seca cuerpo'
        ];
        return v.every(concern => validConcerns.includes(concern));
      },
      message: 'Please select valid skin concerns'
    }
  },
  currentBrands: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        const validBrands = [
          'LA ROCHE POSAY',
          'AVENE',
          'BIODERMA',
          'VICHY',
          'EUCERIN',
          'CETAPHIL',
          'CERAVE',
          'ISDIN',
          'OTRO'
        ];
        return v.every(brand => validBrands.includes(brand));
      },
      message: 'Please select valid brands'
    }
  },
  interests: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        const validInterests = [
          'Lanzamientos',
          'Packs promocionales',
          'Promociones/descuentos',
          'Muestras gratis',
          'Otros'
        ];
        return v.every(interest => validInterests.includes(interest));
      },
      message: 'Please select valid interests'
    }
  },
  eventTypes: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        const validEventTypes = [
          'Exp. con expertos',
          'Eventos de cuidado de la piel',
          'Maquillaje',
          'Faciales'
        ];
        return v.every(eventType => validEventTypes.includes(eventType));
      },
      message: 'Please select valid event types'
    }
  },
  preferences: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(pref => typeof pref === 'string' && pref.length > 0);
      },
      message: 'Preferences must be an array of non-empty strings'
    }
  },
  importantDates: {
    type: [Date],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(date => date instanceof Date && !isNaN(date));
      },
      message: 'Important dates must be valid dates'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  consentGiven: {
    type: Boolean,
    default: false
  },
  consentDate: {
    type: Date,
    required: function() {
      return this.consentGiven === true;
    },
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Consent date must be a valid date'
    }
  }
});

// Create indexes for better query performance
clientSchema.index({ firstName: 1, lastName: 1 });
clientSchema.index({ phoneNumber: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ birthday: 1 });
clientSchema.index({ consentGiven: 1 });
clientSchema.index({ skinType: 1 });
clientSchema.index({ currentBrands: 1 });
clientSchema.index({ interests: 1 });
clientSchema.index({ eventTypes: 1 });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client; 