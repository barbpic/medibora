from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.patient import Patient
from app.models.vital_signs import VitalSigns
from app.models.encounter import Encounter
from app.models.user import User
from app.models.audit_log import AuditLog
from app.ai.intelligent_search_tf_idf import get_search_engine, expand_medical_query
from app.ai.rule_based_engine import get_rule_engine, AlertSeverity
from app.ai.risk_classifier import get_risk_classifier
from app.utils.interoperability import get_interoperability_service

ai_bp = Blueprint('ai', __name__)

def log_action(user_id, action, resource_type=None, resource_id=None, details=None, success=True):
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent'),
        success=success
    )
    db.session.add(log)
    db.session.commit()

# ==================== INTELLIGENT SEARCH (TF-IDF) ====================

@ai_bp.route('/search', methods=['GET'])
@jwt_required()
def intelligent_search():
    """
    AI-Powered Intelligent Search using TF-IDF and Cosine Similarity
    Processes clinical notes with NLP for semantic search
    """
    current_user_id = int(int(get_jwt_identity()))
    query = request.args.get('q', '')
    patient_id = request.args.get('patient_id', type=int)
    top_k = request.args.get('limit', 10, type=int)
    
    if not query:
        return jsonify({'results': []}), 200
    
    # Expand medical query with synonyms
    expanded_query = expand_medical_query(query)
    
    # Get search engine and index documents if needed
    search_engine = get_search_engine()
    
    # Build document index from patient data
    documents = []
    patients = Patient.query.filter_by(is_active=True).all()
    
    for patient in patients:
        # Add patient document
        documents.append({
            'id': patient.id,
            'type': 'patient',
            'title': f"{patient.last_name}, {patient.first_name}",
            'content': f"{patient.chronic_conditions or ''} {patient.allergies or ''} {patient.current_medications or ''}",
            'metadata': {
                'patient_id': patient.id,
                'patient_id_number': patient.patient_id,
                'age': patient.get_age(),
                'gender': patient.gender
            }
        })
        
        # Add encounter documents
        for encounter in patient.encounters:
            documents.append({
                'id': encounter.id,
                'type': 'encounter',
                'title': f"Encounter {encounter.encounter_id}",
                'content': f"{encounter.chief_complaint or ''} {encounter.assessment or ''} {encounter.diagnosis_primary or ''}",
                'metadata': {
                    'patient_id': patient.id,
                    'encounter_id': encounter.encounter_id,
                    'visit_date': encounter.visit_date.isoformat() if encounter.visit_date else None,
                    'visit_type': encounter.visit_type
                }
            })
    
    # Index documents
    search_engine.index_documents(documents)
    
    # Perform search
    if patient_id:
        results = search_engine.search_by_patient(expanded_query, patient_id, top_k)
    else:
        results = search_engine.search(expanded_query, top_k)
    
    # Format results
    formatted_results = []
    for result in results:
        formatted_results.append({
            'id': result.id,
            'type': result.type,
            'title': result.title,
            'content': result.content,
            'relevance_score': round(result.similarity_score * 100, 2),
            'metadata': result.metadata,
            'url': f"/patients/{result.metadata.get('patient_id', result.id)}" if result.type == 'patient' else f"/encounters/{result.id}"
        })
    
    # Get similar term suggestions
    suggestions = search_engine.suggest_similar_terms(query)
    
    log_action(current_user_id, 'ai_search', None, None, f'Search query: {query}')
    
    return jsonify({
        'query': query,
        'expanded_query': expanded_query,
        'suggestions': suggestions,
        'results': formatted_results,
        'total': len(formatted_results)
    }), 200


# ==================== RULE-BASED ALERT ENGINE ====================

@ai_bp.route('/alerts/evaluate/<int:patient_id>', methods=['POST'])
@jwt_required()
def evaluate_patient_alerts(patient_id):
    """
    Rule-Based Decision Support & Alert Engine
    Evaluates patient data against clinical rules (O(n) complexity)
    """
    current_user_id = int(get_jwt_identity())
    
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    # Get latest vital signs
    latest_vitals = VitalSigns.query.filter_by(patient_id=patient_id).order_by(VitalSigns.recorded_at.desc()).first()
    
    # Get last encounter
    last_encounter = Encounter.query.filter_by(patient_id=patient_id).order_by(Encounter.visit_date.desc()).first()
    
    # Calculate days since last visit
    days_since_last_visit = 365
    if last_encounter and last_encounter.visit_date:
        days_since_last_visit = (db.func.current_date() - db.func.date(last_encounter.visit_date)).days
    
    # Build patient data for rule evaluation
    patient_data = {
        'id': patient.id,
        'age': patient.get_age(),
        'chronic_conditions': patient.chronic_conditions or '',
        'days_since_last_visit': days_since_last_visit,
        'bp_systolic': latest_vitals.blood_pressure_systolic if latest_vitals else 120,
        'bp_diastolic': latest_vitals.blood_pressure_diastolic if latest_vitals else 80,
        'temperature': latest_vitals.temperature if latest_vitals else 37.0,
        'heart_rate': latest_vitals.heart_rate if latest_vitals else 72,
        'oxygen_saturation': latest_vitals.oxygen_saturation if latest_vitals else 98,
        'missed_appointment': False,  # Would be calculated from appointment data
        'days_since_appointment': 0,
        'days_since_refill': 0,
        'current_medications': patient.current_medications or ''
    }
    
    # Evaluate rules
    rule_engine = get_rule_engine()
    alerts = rule_engine.evaluate_patient(patient_data)
    
    # Format alerts
    formatted_alerts = []
    for alert in alerts:
        formatted_alerts.append({
            'rule_id': alert.rule_id,
            'rule_name': alert.rule_name,
            'message': alert.message,
            'severity': alert.severity.value,
            'category': alert.category,
            'recommendation': alert.recommendation,
            'created_at': alert.created_at.isoformat()
        })
    
    log_action(current_user_id, 'evaluate_alerts', 'patient', str(patient_id), f'Generated {len(alerts)} alerts')
    
    return jsonify({
        'patient_id': patient_id,
        'alert_count': len(formatted_alerts),
        'alerts': formatted_alerts
    }), 200


@ai_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_critical_alerts():
    """Get all critical alerts across patients"""
    current_user_id = int(get_jwt_identity())
    
    # Get all vital signs with critical alerts
    critical_vitals = VitalSigns.query.filter(
        VitalSigns.alert_generated == True
    ).order_by(VitalSigns.recorded_at.desc()).limit(20).all()
    
    alerts = []
    for vital in critical_vitals:
        patient = Patient.query.get(vital.patient_id)
        if patient:
            alerts.append({
                'id': vital.id,
                'patient_id': patient.id,
                'patient_name': patient.full_name,
                'patient_id_number': patient.patient_id,
                'severity': vital.alert_severity,
                'description': vital.alert_description,
                'recorded_at': vital.recorded_at.isoformat() if vital.recorded_at else None,
                'vital_signs': vital.to_dict()
            })
    
    log_action(current_user_id, 'view_alerts', None, None, f'Viewed {len(alerts)} critical alerts')
    
    return jsonify({
        'alerts': alerts,
        'total': len(alerts)
    }), 200


# ==================== MACHINE LEARNING RISK CLASSIFICATION ====================

@ai_bp.route('/risk-assessment/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_risk_assessment(patient_id):
    """
    Machine Learning-Based Risk Classification
    Uses Logistic Regression to predict missed follow-up risk
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user.has_permission('ai_features'):
        log_action(current_user_id, 'risk_assessment', 'patient', str(patient_id), 'Permission denied', False)
        return jsonify({'error': 'Permission denied'}), 403
    
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    # Get patient's encounter history
    encounters = Encounter.query.filter_by(patient_id=patient_id).all()
    
    # Get last encounter date
    last_encounter = Encounter.query.filter_by(patient_id=patient_id).order_by(Encounter.visit_date.desc()).first()
    
    # Build patient data for risk prediction
    patient_data = {
        'id': patient.id,
        'age': patient.get_age(),
        'last_visit': last_encounter.visit_date.isoformat() if last_encounter and last_encounter.visit_date else None,
        'chronic_conditions': patient.chronic_conditions,
        'visit_count_last_year': len([e for e in encounters if e.visit_date and (db.func.current_date() - db.func.date(e.visit_date)).days < 365]),
        'missed_appointments': 0,  # Would be calculated from appointment data
        'current_medications': patient.current_medications
    }
    
    # Perform risk assessment
    classifier = get_risk_classifier()
    prediction = classifier.predict_risk(patient_data)
    
    # Get feature importance
    feature_importance = classifier.get_feature_importance()
    
    log_action(current_user_id, 'risk_assessment', 'patient', str(patient_id), f'Risk: {prediction.risk_level}')
    
    return jsonify({
        'patient_id': patient_id,
        'patient_name': patient.full_name,
        'assessment': {
            'risk_score': prediction.risk_score,
            'risk_level': prediction.risk_level,
            'probability': prediction.probability,
            'features_used': prediction.features_used,
            'feature_importance': feature_importance,
            'recommendation': prediction.recommendation,
            'assessed_at': prediction.timestamp.isoformat()
        }
    }), 200


@ai_bp.route('/risk-assessment/batch', methods=['POST'])
@jwt_required()
def batch_risk_assessment():
    """Perform risk assessment for multiple patients"""
    current_user_id = int(get_jwt_identity())
    
    data = request.get_json()
    patient_ids = data.get('patient_ids', [])
    
    if not patient_ids:
        return jsonify({'error': 'No patient IDs provided'}), 400
    
    classifier = get_risk_classifier()
    results = []
    
    for patient_id in patient_ids:
        patient = Patient.query.get(patient_id)
        if patient:
            last_encounter = Encounter.query.filter_by(patient_id=patient_id).order_by(Encounter.visit_date.desc()).first()
            encounters = Encounter.query.filter_by(patient_id=patient_id).all()
            
            patient_data = {
                'id': patient.id,
                'age': patient.get_age(),
                'last_visit': last_encounter.visit_date.isoformat() if last_encounter and last_encounter.visit_date else None,
                'chronic_conditions': patient.chronic_conditions,
                'visit_count_last_year': len(encounters),
                'missed_appointments': 0,
                'current_medications': patient.current_medications
            }
            
            prediction = classifier.predict_risk(patient_data)
            results.append({
                'patient_id': patient_id,
                'patient_name': patient.full_name,
                'risk_score': prediction.risk_score,
                'risk_level': prediction.risk_level
            })
    
    log_action(current_user_id, 'batch_risk_assessment', None, None, f'Assessed {len(results)} patients')
    
    return jsonify({
        'total': len(results),
        'high_risk': len([r for r in results if r['risk_level'] == 'HIGH']),
        'medium_risk': len([r for r in results if r['risk_level'] == 'MEDIUM']),
        'low_risk': len([r for r in results if r['risk_level'] == 'LOW']),
        'results': results
    }), 200


# ==================== DIAGNOSIS SUGGESTIONS ====================

@ai_bp.route('/suggestions/diagnosis', methods=['POST'])
@jwt_required()
def get_diagnosis_suggestions():
    """Get AI-powered diagnosis suggestions based on symptoms"""
    current_user_id = int(get_jwt_identity())
    
    data = request.get_json()
    symptoms = data.get('symptoms', [])
    
    if not symptoms:
        return jsonify({'suggestions': []}), 200
    
    # Symptom-Diagnosis mapping based on common Kenyan conditions
    symptom_diagnosis_map = {
        'fever': [
            {'diagnosis': 'Malaria', 'icd10': 'B50-B54', 'confidence': 85},
            {'diagnosis': 'Typhoid Fever', 'icd10': 'A01.0', 'confidence': 70},
            {'diagnosis': 'Respiratory Infection', 'icd10': 'J06.9', 'confidence': 65},
            {'diagnosis': 'COVID-19', 'icd10': 'U07.1', 'confidence': 60},
            {'diagnosis': 'Dengue Fever', 'icd10': 'A90', 'confidence': 45}
        ],
        'cough': [
            {'diagnosis': 'Acute Bronchitis', 'icd10': 'J20.9', 'confidence': 80},
            {'diagnosis': 'Pneumonia', 'icd10': 'J18.9', 'confidence': 75},
            {'diagnosis': 'Tuberculosis', 'icd10': 'A15.0', 'confidence': 60},
            {'diagnosis': 'Asthma', 'icd10': 'J45.9', 'confidence': 55},
            {'diagnosis': 'COVID-19', 'icd10': 'U07.1', 'confidence': 50}
        ],
        'headache': [
            {'diagnosis': 'Tension Headache', 'icd10': 'G44.2', 'confidence': 75},
            {'diagnosis': 'Migraine', 'icd10': 'G43.9', 'confidence': 65},
            {'diagnosis': 'Malaria', 'icd10': 'B50-B54', 'confidence': 60},
            {'diagnosis': 'Hypertension', 'icd10': 'I10', 'confidence': 50},
            {'diagnosis': 'Meningitis', 'icd10': 'G03.9', 'confidence': 30}
        ],
        'chest pain': [
            {'diagnosis': 'Angina Pectoris', 'icd10': 'I20.9', 'confidence': 80},
            {'diagnosis': 'Myocardial Infarction', 'icd10': 'I21.9', 'confidence': 70},
            {'diagnosis': 'GERD', 'icd10': 'K21.9', 'confidence': 55},
            {'diagnosis': 'Costochondritis', 'icd10': 'M94.0', 'confidence': 45},
            {'diagnosis': 'Pneumonia', 'icd10': 'J18.9', 'confidence': 40}
        ],
        'shortness of breath': [
            {'diagnosis': 'Asthma', 'icd10': 'J45.9', 'confidence': 80},
            {'diagnosis': 'Pneumonia', 'icd10': 'J18.9', 'confidence': 75},
            {'diagnosis': 'Heart Failure', 'icd10': 'I50.9', 'confidence': 65},
            {'diagnosis': 'COPD', 'icd10': 'J44.9', 'confidence': 60},
            {'diagnosis': 'Pulmonary Embolism', 'icd10': 'I26.9', 'confidence': 35}
        ],
        'abdominal pain': [
            {'diagnosis': 'Gastritis', 'icd10': 'K29.7', 'confidence': 70},
            {'diagnosis': 'Appendicitis', 'icd10': 'K35.8', 'confidence': 65},
            {'diagnosis': 'Peptic Ulcer', 'icd10': 'K27.9', 'confidence': 60},
            {'diagnosis': 'Gastroenteritis', 'icd10': 'A09', 'confidence': 55},
            {'diagnosis': 'Cholecystitis', 'icd10': 'K81.0', 'confidence': 40}
        ],
        'diarrhea': [
            {'diagnosis': 'Gastroenteritis', 'icd10': 'A09', 'confidence': 85},
            {'diagnosis': 'Food Poisoning', 'icd10': 'A05.9', 'confidence': 70},
            {'diagnosis': 'Dysentery', 'icd10': 'A03.9', 'confidence': 50},
            {'diagnosis': 'Cholera', 'icd10': 'A00.9', 'confidence': 30},
            {'diagnosis': 'IBS', 'icd10': 'K58.9', 'confidence': 25}
        ],
        'rash': [
            {'diagnosis': 'Allergic Reaction', 'icd10': 'T78.4', 'confidence': 75},
            {'diagnosis': 'Dermatitis', 'icd10': 'L30.9', 'confidence': 65},
            {'diagnosis': 'Measles', 'icd10': 'B05.9', 'confidence': 50},
            {'diagnosis': 'Chickenpox', 'icd10': 'B01.9', 'confidence': 45},
            {'diagnosis': 'Typhoid (Rose Spots)', 'icd10': 'A01.0', 'confidence': 35}
        ],
        'joint pain': [
            {'diagnosis': 'Osteoarthritis', 'icd10': 'M19.90', 'confidence': 75},
            {'diagnosis': 'Malaria', 'icd10': 'B50-B54', 'confidence': 60},
            {'diagnosis': 'Dengue Fever', 'icd10': 'A90', 'confidence': 50},
            {'diagnosis': 'Rheumatoid Arthritis', 'icd10': 'M06.9', 'confidence': 45},
            {'diagnosis': 'Gout', 'icd10': 'M10.9', 'confidence': 35}
        ],
        'fatigue': [
            {'diagnosis': 'Anemia', 'icd10': 'D64.9', 'confidence': 70},
            {'diagnosis': 'Malaria', 'icd10': 'B50-B54', 'confidence': 65},
            {'diagnosis': 'Hypothyroidism', 'icd10': 'E03.9', 'confidence': 50},
            {'diagnosis': 'Depression', 'icd10': 'F32.9', 'confidence': 45},
            {'diagnosis': 'Diabetes', 'icd10': 'E11.9', 'confidence': 40}
        ]
    }
    
    # Aggregate suggestions from all symptoms
    suggestions_map = {}
    for symptom in symptoms:
        symptom_lower = symptom.lower()
        if symptom_lower in symptom_diagnosis_map:
            for diag in symptom_diagnosis_map[symptom_lower]:
                key = diag['diagnosis']
                if key in suggestions_map:
                    suggestions_map[key]['confidence'] = min(95, suggestions_map[key]['confidence'] + 15)
                else:
                    suggestions_map[key] = diag.copy()
    
    # Sort by confidence
    sorted_suggestions = sorted(suggestions_map.values(), key=lambda x: x['confidence'], reverse=True)
    
    log_action(current_user_id, 'diagnosis_suggestions', None, None, f'Symptoms: {symptoms}')
    
    return jsonify({
        'symptoms': symptoms,
        'suggestions': sorted_suggestions[:5]
    }), 200


# ==================== DASHBOARD STATS ====================

@ai_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get AI-enhanced dashboard statistics"""
    current_user_id = int(get_jwt_identity())
    
    # Get statistics
    total_patients = Patient.query.filter_by(is_active=True).count()
    total_encounters = Encounter.query.count()
    today_encounters = Encounter.query.filter(
        db.func.date(Encounter.visit_date) == db.func.current_date()
    ).count()
    critical_alerts = VitalSigns.query.filter(
        VitalSigns.alert_generated == True,
        VitalSigns.alert_severity.in_(['high', 'critical'])
    ).count()
    
    # Get high-risk patients
    classifier = get_risk_classifier()
    high_risk_count = 0
    
    # Recent patients
    recent_patients = Patient.query.filter_by(is_active=True).order_by(
        Patient.created_at.desc()
    ).limit(5).all()
    
    log_action(current_user_id, 'view_dashboard_stats', None, None, 'Viewed dashboard statistics')
    
    return jsonify({
        'stats': {
            'total_patients': total_patients,
            'total_encounters': total_encounters,
            'today_encounters': today_encounters,
            'critical_alerts': critical_alerts,
            'high_risk_patients': high_risk_count
        },
        'recent_patients': [p.to_summary_dict() for p in recent_patients]
    }), 200


# ==================== INTEROPERABILITY ENDPOINTS ====================

@ai_bp.route('/export/fhir/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def export_patient_fhir(patient_id):
    """Export patient data in FHIR format"""
    current_user_id = int(get_jwt_identity())
    
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    interop = get_interoperability_service()
    fhir_json = interop.export_patient_fhir(patient)
    
    log_action(current_user_id, 'export_fhir', 'patient', str(patient_id), 'Exported to FHIR')
    
    return jsonify({
        'patient_id': patient_id,
        'format': 'FHIR R4',
        'data': json.loads(fhir_json)
    }), 200


@ai_bp.route('/export/hl7/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def export_patient_hl7(patient_id):
    """Export patient data in HL7 v2.x format"""
    current_user_id = int(get_jwt_identity())
    
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    interop = get_interoperability_service()
    hl7_message = interop.export_patient_hl7(patient)
    
    log_action(current_user_id, 'export_hl7', 'patient', str(patient_id), 'Exported to HL7')
    
    return jsonify({
        'patient_id': patient_id,
        'format': 'HL7 v2.5',
        'message': hl7_message
    }), 200


@ai_bp.route('/export/fhir/bundle/<int:patient_id>', methods=['GET'])
@jwt_required()
def export_patient_bundle(patient_id):
    """Export complete patient summary as FHIR Bundle"""
    current_user_id = int(get_jwt_identity())
    
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    encounters = Encounter.query.filter_by(patient_id=patient_id).all()
    vitals = VitalSigns.query.filter_by(patient_id=patient_id).all()
    
    interop = get_interoperability_service()
    bundle_json = interop.create_patient_summary_bundle(patient, encounters, vitals)
    
    log_action(current_user_id, 'export_fhir_bundle', 'patient', str(patient_id), 'Exported FHIR Bundle')
    
    return jsonify({
        'patient_id': patient_id,
        'format': 'FHIR R4 Bundle',
        'data': json.loads(bundle_json)
    }), 200


import json
