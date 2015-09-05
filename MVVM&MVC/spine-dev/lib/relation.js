// Generated by CoffeeScript 1.9.3
(function() {
  var Collection, Instance, Singleton, Spine, association, requireModel, singularize, underscore,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Spine = this.Spine || require('spine');

  Collection = (function(superClass) {
    extend(Collection, superClass);

    function Collection(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Collection.prototype.all = function() {
      return this.model.select((function(_this) {
        return function(rec) {
          return _this.associated(rec);
        };
      })(this));
    };

    Collection.prototype.first = function() {
      return this.all()[0];
    };

    Collection.prototype.last = function() {
      var values;
      values = this.all();
      return values[values.length - 1];
    };

    Collection.prototype.count = function() {
      return this.all().length;
    };

    Collection.prototype.find = function(id, notFound) {
      var records;
      if (notFound == null) {
        notFound = this.model.notFound;
      }
      records = this.select((function(_this) {
        return function(rec) {
          return ("" + rec.id) === ("" + id);
        };
      })(this));
      return records[0] || (typeof notFound === "function" ? notFound(id) : void 0);
    };

    Collection.prototype.findAllByAttribute = function(name, value) {
      return this.model.select((function(_this) {
        return function(rec) {
          return _this.associated(rec) && rec[name] === value;
        };
      })(this));
    };

    Collection.prototype.findByAttribute = function(name, value) {
      return this.findAllByAttribute(name, value)[0];
    };

    Collection.prototype.select = function(cb) {
      return this.model.select((function(_this) {
        return function(rec) {
          return _this.associated(rec) && cb(rec);
        };
      })(this));
    };

    Collection.prototype.refresh = function(values) {
      var i, j, k, l, len, len1, len2, match, record, ref, ref1;
      if (values == null) {
        return this;
      }
      ref = this.all();
      for (j = 0, len = ref.length; j < len; j++) {
        record = ref[j];
        delete this.model.irecords[record.id];
        ref1 = this.model.records;
        for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
          match = ref1[i];
          if (!(match.id === record.id)) {
            continue;
          }
          this.model.records.splice(i, 1);
          break;
        }
      }
      if (!Array.isArray(values)) {
        values = [values];
      }
      for (l = 0, len2 = values.length; l < len2; l++) {
        record = values[l];
        record.newRecord = false;
        record[this.fkey] = this.record.id;
      }
      this.model.refresh(values);
      return this;
    };

    Collection.prototype.create = function(record, options) {
      record[this.fkey] = this.record.id;
      return this.model.create(record, options);
    };

    Collection.prototype.add = function(record, options) {
      return record.updateAttribute(this.fkey, this.record.id, options);
    };

    Collection.prototype.remove = function(record, options) {
      return record.updateAttribute(this.fkey, null, options);
    };

    Collection.prototype.associated = function(record) {
      return record[this.fkey] === this.record.id;
    };

    return Collection;

  })(Spine.Module);

  Instance = (function(superClass) {
    extend(Instance, superClass);

    function Instance(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Instance.prototype.find = function() {
      return this.model.find(this.record[this.fkey]);
    };

    Instance.prototype.update = function(value) {
      if (value == null) {
        return this;
      }
      if (!(value instanceof this.model)) {
        value = new this.model(value);
      }
      if (value.isNew()) {
        value.save();
      }
      this.record[this.fkey] = value && value.id;
      return this;
    };

    return Instance;

  })(Spine.Module);

  Singleton = (function(superClass) {
    extend(Singleton, superClass);

    function Singleton(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    Singleton.prototype.find = function() {
      return this.record.id && this.model.findByAttribute(this.fkey, this.record.id);
    };

    Singleton.prototype.update = function(value) {
      if (value == null) {
        return this;
      }
      if (!(value instanceof this.model)) {
        value = this.model.fromJSON(value);
      }
      value[this.fkey] = this.record.id;
      value.save();
      return this;
    };

    return Singleton;

  })(Spine.Module);

  singularize = function(str) {
    return str.replace(/s$/, '');
  };

  underscore = function(str) {
    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/-/g, '_').toLowerCase();
  };

  requireModel = function(model) {
    if (typeof model === 'string') {
      return (typeof require === "function" ? require(model) : void 0) || eval(model);
    } else {
      return model;
    }
  };

  association = function(name, model, record, fkey, Ctor) {
    if (typeof model === 'string') {
      model = requireModel(model);
    }
    return new Ctor({
      name: name,
      model: model,
      record: record,
      fkey: fkey
    });
  };

  Spine.Model.extend({
    hasMany: function(name, model, fkey) {
      if (fkey == null) {
        fkey = (underscore(this.className)) + "_id";
      }
      return this.prototype[name] = function(value) {
        return association(name, model, this, fkey, Collection).refresh(value);
      };
    },
    belongsTo: function(name, model, fkey) {
      if (fkey == null) {
        fkey = (underscore(singularize(name))) + "_id";
      }
      this.prototype[name] = function(value) {
        return association(name, model, this, fkey, Instance).update(value).find();
      };
      return this.attributes.push(fkey);
    },
    hasOne: function(name, model, fkey) {
      if (fkey == null) {
        fkey = (underscore(this.className)) + "_id";
      }
      return this.prototype[name] = function(value) {
        return association(name, model, this, fkey, Singleton).update(value).find();
      };
    }
  });

  Spine.Collection = Collection;

  Spine.Singleton = Singleton;

  Spine.Instance = Instance;

}).call(this);