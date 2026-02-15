from django.db import models


class Job(models.Model):
    """Service job posted by admin and handled by employees."""

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    customer_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=50)
    location = models.CharField(max_length=255)
    issue = models.TextField()
    work_date = models.DateField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Job #{self.pk} - {self.customer_name}"


class Rental(models.Model):
    """Rental record for devices."""

    customer_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=50)
    device_serial = models.CharField(max_length=100)
    from_date = models.DateField()
    to_date = models.DateField()
    rental_days = models.PositiveIntegerField()
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2)
    id_proof = models.ImageField(upload_to='rentals/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Device(models.Model):
    """Device inventory."""

    AVAILABILITY_CHOICES = [
        ("available", "Available"),
        ("rented", "Rented"),
        ("maintenance", "Maintenance"),
    ]

    serial_no = models.CharField(max_length=100, unique=True)
    model = models.CharField(max_length=255)
    availability = models.CharField(
        max_length=20, choices=AVAILABILITY_CHOICES, default="available"
    )

    def __str__(self) -> str:
        return f"{self.model} ({self.serial_no})"


class JobReport(models.Model):
    """Completion report submitted by staff members."""

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="reports")
    company_name = models.CharField(max_length=255)
    time_taken = models.CharField(max_length=100)
    equipment_used = models.TextField()
    work_description = models.TextField()
    completion_photo_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


